import { Footer } from "flowbite-react";

export default function MyFooter() {
  return (
    <Footer container={true}>
      <div className="w-full text-center">
        <Footer.Divider />
        <Footer.Copyright href="#" by="Curest0x™" year={2023} />
      </div>
    </Footer>
  );
}
