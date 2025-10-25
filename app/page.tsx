import { redirect } from "next/navigation";

export default function Home() {
  redirect("/account/user-management/super-admin");
  return <></>;
}
