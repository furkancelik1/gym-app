import { Redirect } from "expo-router";

export default function AnaKapi() {
  // Siteye giren herkesi anında login ekranına fırlatır
  return <Redirect href="/login" />;
}
