import React, { ReactElement } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import {
  setNewDefaultWalletValue,
  selectDefaultWallet,
  selectHideDust,
  toggleHideDust,
  selectShowTestNetworks,
  toggleTestNetworks,
} from "@tallyho/tally-background/redux-slices/ui"
import {
  SUPPORT_ANALYTICS,
  ALLOW_CHANGE_PASSWORD,
  SUPPORT_GOERLI,
  SUPPORT_MULTIPLE_LANGUAGES,
} from "@tallyho/tally-background/features"
import SharedButton from "../components/Shared/SharedButton"
import SharedToggleButton from "../components/Shared/SharedToggleButton"
import SharedSelect from "../components/Shared/SharedSelect"
import { getLanguageIndex, getAvalableLanguages } from "../_locales"
import { getLanguage, setLanguage } from "../_locales/i18n"
import SettingButton from "./Settings/SettingButton"

function SettingRow(props: {
  hideTitle?: boolean
  title: string
  component: () => ReactElement
}): ReactElement {
  const { hideTitle, title, component } = props

  return (
    <li>
      {!hideTitle && <div className="left">{title}</div>}
      <div className="right">{component()}</div>
      <style jsx>
        {`
          li {
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .left {
            color: var(--green-20);
            font-size: 18px;
            font-weight: 600;
            line-height: 24px;
          }
        `}
      </style>
    </li>
  )
}

export default function Settings(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const hideDust = useSelector(selectHideDust)
  const defaultWallet = useSelector(selectDefaultWallet)
  const showTestNetworks = useSelector(selectShowTestNetworks)

  const toggleHideDustAssets = (toggleValue: boolean) => {
    dispatch(toggleHideDust(toggleValue))
  }
  const toggleDefaultWallet = (defaultWalletValue: boolean) => {
    dispatch(setNewDefaultWalletValue(defaultWalletValue))
  }

  const toggleShowTestNetworks = (defaultWalletValue: boolean) => {
    dispatch(toggleTestNetworks(defaultWalletValue))
  }

  const hideSmallAssetBalance = {
    title: t("settings.hideSmallAssetBalance", { amount: 2, sign: "$" }),
    component: () => (
      <SharedToggleButton
        onChange={(toggleValue) => toggleHideDustAssets(toggleValue)}
        value={hideDust}
      />
    ),
  }

  const setAsDefault = {
    title: t("settings.setAsDefault"),
    component: () => (
      <SharedToggleButton
        onChange={(toggleValue) => toggleDefaultWallet(toggleValue)}
        value={defaultWallet}
      />
    ),
  }

  const enableTestNetworks = {
    title: t("settings.enableTestNetworks"),
    component: () => (
      <SharedToggleButton
        onChange={(toggleValue) => toggleShowTestNetworks(toggleValue)}
        value={showTestNetworks}
      />
    ),
  }

  const langOptions = getAvalableLanguages()
  const langIdx = getLanguageIndex(getLanguage())
  const languages = {
    title: t("settings.language"),
    component: () => (
      <SharedSelect
        width={194}
        options={langOptions}
        onChange={setLanguage}
        defaultIndex={langIdx}
      />
    ),
  }

  const changePassword = {
    hideTitle: true,
    title: t("settings.changePassword.title"),
    component: () => (
      <SettingButton
        link="/keyring/change-password"
        label={t("settings.changePassword.title")}
        ariaLabel={t("settings.exportLogs.ariaLabel")}
      />
    ),
  }

  const bugReport = {
    hideTitle: true,
    title: t("settings.bugReport"),
    component: () => (
      <SettingButton
        link="/settings/export-logs"
        label={t("settings.bugReport")}
        ariaLabel={t("settings.exportLogs.ariaLabel")}
      />
    ),
  }

  const analytics = {
    hideTitle: true,
    title: t("settings.analytics"),
    component: () => (
      <SettingButton
        link=""
        label={t("settings.analytics")}
        ariaLabel={t("settings.analyticsSetUp.ariaLabel")}
      />
    ),
  }

  const generalList: {
    hideTitle?: boolean
    title: string
    component: () => JSX.Element
  }[] = [
    hideSmallAssetBalance,
    setAsDefault,
    ...(SUPPORT_MULTIPLE_LANGUAGES ? [languages] : []),
    ...(SUPPORT_GOERLI ? [enableTestNetworks] : []),
    ...(ALLOW_CHANGE_PASSWORD ? [changePassword] : []),
    bugReport,
    ...(SUPPORT_ANALYTICS ? [analytics] : []),
  ]

  const settings = {
    general: generalList,
  }

  return (
    <>
      <section className="standard_width_padded">
        <h1>{t("settings.mainMenu")}</h1>
        <ul>
          {settings.general.map((setting) => (
            <SettingRow
              hideTitle={setting.hideTitle}
              key={setting.title}
              title={setting.title}
              component={setting.component}
            />
          ))}
        </ul>
        <div className="community_cta_wrap">
          <h2>{t("settings.joinTitle")}</h2>
          <p>{t("settings.joinDesc")}</p>
          <SharedButton
            type="primary"
            size="large"
            iconMedium="discord"
            iconPosition="left"
            onClick={() => {
              window.open(`https://chat.tally.cash/`, "_blank")?.focus()
            }}
          >
            {t("settings.joinBtn")}
          </SharedButton>
        </div>
        <div className="version">
          Version: {process.env.VERSION ?? `<unknown>`}_
          {process.env.COMMIT_SHA?.slice(0, 7) ?? `<unknown>`}
        </div>
      </section>
      <style jsx>
        {`
          section {
            display: flex;
            flex-flow: column;
            height: 544px;
            background-color: var(--hunter-green);
          }
          .community_cta_wrap {
            width: 100vw;
            margin-top: auto;
            margin-left: -21px;
            background-color: var(--green-95);
            text-align: center;
            padding: 24px 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          h1 {
            color: #fff;
            font-size: 22px;
            font-weight: 500;
            line-height: 32px;
            margin-bottom: 5px;
          }
          h2 {
            font-weight: 500;
            font-size: 22px;
            padding: 0;
            margin: 0 0 -1px 0;
          }
          p {
            color: var(--green-20);
            text-align: center;
            font-size: 16px;
            margin-top: 6px;
            margin-bottom: 24px;
          }
          span {
            color: var(--green-40);
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
          }
          .mega_discord_chat_bubble_button {
            background: url("./images/tally_ho_chat_bubble@2x.png");
            background-size: cover;
            width: 266px;
            height: 120px;
            margin-top: 20px;
          }
          .mega_discord_chat_bubble_button:hover {
            opacity: 0.8;
          }
          .version {
            color: var(--green-40);
            font-size: 16px;
            font-weight: 500;
            margin: 0 auto;
            padding: 16px 0;
          }
        `}
      </style>
    </>
  )
}
