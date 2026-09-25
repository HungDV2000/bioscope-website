'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const inAppBrowser = () =>
  typeof navigator !== 'undefined' && /Zalo|FBAN|FBAV|Instagram|Line\//i.test(navigator.userAgent)

export const canRecord = () =>
  typeof window !== 'undefined' &&
  !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && 'MediaRecorder' in window)

export type Clip = { blob: Blob; url: string; duration: number }

const pickMime = () =>
  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
    (t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t),
  ) ?? ''

/**
 * Ghi âm bằng MediaRecorder, tự dừng khi chạm `maxSec`.
 *
 * `levels` là mức âm lượng (0–1) cho mỗi vạch sóng — chỉ có khi trình duyệt
 * cho dùng AudioContext; không có thì giao diện chạy sóng giả bằng CSS.
 */
export function useRecorder(maxSec: number, bars = 12) {
  const [state, setState] = useState<'idle' | 'live' | 'done'>('idle')
  const [sec, setSec] = useState(0)
  const [clip, setClip] = useState<Clip | null>(null)
  const [levels, setLevels] = useState<number[] | null>(null)
  const [denied, setDenied] = useState<null | 'inapp' | 'unsupported' | 'permission'>(null)

  const rec = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const ctx = useRef<AudioContext | null>(null)
  const raf = useRef<number | null>(null)
  const secRef = useRef(0)
  const discard = useRef(false)

  const cleanupMedia = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = null
    setLevels(null)
    ctx.current?.close().catch(() => {})
    ctx.current = null
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
  }, [])

  const stop = useCallback(
    (silent = false) => {
      discard.current = silent
      const r = rec.current
      rec.current = null
      if (r && r.state !== 'inactive') r.stop()
      cleanupMedia()
      if (silent) setState((s) => (s === 'live' ? 'idle' : s))
    },
    [cleanupMedia],
  )

  const setFromBlob = useCallback((blob: Blob, duration: number) => {
    setClip((old) => {
      if (old) URL.revokeObjectURL(old.url)
      return { blob, url: URL.createObjectURL(blob), duration }
    })
    setState('done')
  }, [])

  const clear = useCallback(() => {
    stop(true)
    setClip((old) => {
      if (old) URL.revokeObjectURL(old.url)
      return null
    })
    setSec(0)
    setState('idle')
  }, [stop])

  const start = useCallback(async (): Promise<boolean> => {
    if (inAppBrowser()) {
      setDenied('inapp')
      return false
    }
    if (!canRecord()) {
      setDenied('unsupported')
      return false
    }
    let s: MediaStream
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setDenied('permission')
      return false
    }
    setDenied(null)
    stream.current = s
    const mime = pickMime()
    const chunks: Blob[] = []
    const r = new MediaRecorder(s, mime ? { mimeType: mime } : undefined)
    r.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data)
    }
    r.onstop = () => {
      if (discard.current || !chunks.length) return
      setFromBlob(new Blob(chunks, { type: r.mimeType || mime || 'audio/webm' }), secRef.current)
    }
    discard.current = false
    r.start()
    rec.current = r
    secRef.current = 0
    setSec(0)
    setState('live')

    // Vạch sóng theo giọng nói thật
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ac = new AC()
      const an = ac.createAnalyser()
      an.fftSize = 64
      ac.createMediaStreamSource(s).connect(an)
      const data = new Uint8Array(an.frequencyBinCount)
      ctx.current = ac
      const loop = () => {
        an.getByteFrequencyData(data)
        setLevels(Array.from({ length: bars }, (_, i) => Math.max(0.2, data[(i * 2 + 2) % data.length] / 255)))
        raf.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      /* không có AudioContext — dùng sóng CSS */
    }

    timer.current = setInterval(() => {
      secRef.current += 1
      setSec(secRef.current)
      if (secRef.current >= maxSec) stop(false)
    }, 1000)
    return true
  }, [bars, maxSec, setFromBlob, stop])

  // Rời trang / đóng sheet giữa chừng: bỏ bản đang ghi dở và tắt micro.
  useEffect(
    () => () => {
      discard.current = true
      const r = rec.current
      rec.current = null
      if (r && r.state !== 'inactive') r.stop()
      cleanupMedia()
    },
    [cleanupMedia],
  )

  return { state, sec, clip, levels, denied, setDenied, start, stop, clear, setFromBlob }
}

export const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Đọc thời lượng file ghi âm người dùng tải lên. */
export function probeDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const a = document.createElement('audio')
    const url = URL.createObjectURL(blob)
    const done = (d: number) => {
      URL.revokeObjectURL(url)
      resolve(d)
    }
    a.preload = 'metadata'
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? Math.round(a.duration) : 0)
    a.onerror = () => done(0)
    a.src = url
    setTimeout(() => done(0), 4000)
  })
}
