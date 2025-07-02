import { Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

const paths = ["/bets", "/transactions", "/channels", "/analytics"];

export default function Navigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (_: any, newValue: number) => {
    navigate(paths[newValue]);
  };

  const currentIndex = paths.indexOf(location.pathname);

  return (
    <Tabs
      value={currentIndex === -1 ? 0 : currentIndex}
      onChange={handleChange}
    >
      <Tab label={t("navigation.bets")} />
      <Tab label={t("navigation.transactions")} />
      <Tab label={t("navigation.channels")} />
      <Tab label={t("navigation.analytics")} />
    </Tabs>
  );
}
