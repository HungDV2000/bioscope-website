'use client'

import React from 'react'
import { Account, LogOutIcon, Popup, PopupList, useConfig, useTranslation } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

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
        button={<Account />}
        buttonType="custom"
        className="dv-account-menu__popup"
        horizontalAlign="right"
        id="dv-account-menu"
        size="small"
        verticalAlign="bottom"
      >
        <PopupList.ButtonGroup>
          <PopupList.Button href={profileHref} prefetch={false}>
            {t('authentication:account')}
          </PopupList.Button>
          <PopupList.Divider />
          <PopupList.Button href={logoutHref} prefetch={false}>
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
