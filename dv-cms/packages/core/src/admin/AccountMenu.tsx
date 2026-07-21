'use client'

import React from 'react'
import { LogOutIcon, Popup, PopupList, useAuth, useConfig, useTranslation } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

/**
 * Avatar hiển thị trong header. KHÔNG dùng `<Account />` của Payload ở đây:
 * component này được gắn vào `admin.avatar`, mà `<Account />` lại phân giải
 * ngược về chính `admin.avatar` → đệ quy, Payload chặn và render ra một nút
 * RỖNG (đúng triệu chứng "không có icon user"). Vì vậy ta tự vẽ avatar.
 */
const Avatar: React.FC = () => {
  const { user } = useAuth()
  const label = (user?.name as string) || (user?.email as string) || ''
  const initial = label.trim().charAt(0).toUpperCase() || '?'

  return (
    <span className="dv-account-menu__avatar" aria-hidden title={label}>
      {initial}
    </span>
  )
}

/** Avatar header — dropdown: Hồ sơ + Đăng xuất (thay link trực tiếp vào account). */
export const AccountMenu: React.FC = () => {
  const { t } = useTranslation()
  const { config } = useConfig()
  const {
    admin: {
      routes: { account: accountRoute, logout: logoutRoute },
    },
    routes: { admin: adminRoute },
  } = config

  const profileHref = formatAdminURL({ adminRoute, path: accountRoute })
  const logoutHref = formatAdminURL({ adminRoute, path: logoutRoute })

  return (
    <div
      className="dv-account-menu"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Popup
        button={<Avatar />}
        buttonType="custom"
        className="dv-account-menu__popup"
        horizontalAlign="right"
        id="dv-account-menu"
        size="small"
        verticalAlign="bottom"
      >
        <PopupList.ButtonGroup>
          <PopupList.Button href={profileHref}>
            {t('authentication:account')}
          </PopupList.Button>
          <PopupList.Divider />
          <PopupList.Button href={logoutHref}>
            <span className="dv-account-menu__logout">
              <LogOutIcon />
              {t('authentication:logOut')}
            </span>
          </PopupList.Button>
        </PopupList.ButtonGroup>
      </Popup>
    </div>
  )
}

export default AccountMenu
