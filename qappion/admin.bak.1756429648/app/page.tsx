import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // panelin neredeyse oraya çevir: /admin, /panel, /login vs.
  return null;
}