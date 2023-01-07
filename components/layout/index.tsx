import { PropsWithChildren } from "react";
import Navigation from "../navigation";
import MyFooter from "../footer";

export default function Layout({children}: PropsWithChildren) {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
      <MyFooter />
    </div>
  )
}