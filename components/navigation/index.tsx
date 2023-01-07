import { DarkThemeToggle, Navbar } from "flowbite-react";

export default function Navigation() {
  return (
    <Navbar fluid={true} rounded={true}>
      <Navbar.Brand>
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">DeBooks</span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <div className="flex md:order-2">
        <DarkThemeToggle />
      </div>
    </Navbar>
  )
}