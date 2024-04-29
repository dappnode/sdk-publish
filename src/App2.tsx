import React from "react";
import Header from "components/newComponents/Header";
import Input from "components/newComponents/Input";
import Title from "components/newComponents/Title";
import Link from "components/newComponents/Link";
import Button from "components/newComponents/Button";
import BackBtn from "components/newComponents/BackBtn";

export function App() {
  return (
    <div className="flex h-screen w-screen flex-col ">
      <Header />
      <div className=" bg-background-color flex h-full flex-col items-center">
        <div className="mt-[10%] min-h-min w-2/5 rounded-3xl bg-white p-9">
          <Title title="Publish your package" />
          <Link href={"a"}> aa</Link>
          <Input
            name="Dappnode"
            placeholder="this is dappnode"
            value=""
            onChange={console.log()}
          />
          <Button onClick={undefined}>Start</Button>
          <BackBtn onClick={undefined} />
          <Button onClick={undefined} disabled={true}>
            disabled
          </Button>
        </div>
      </div>
    </div>
  );
}
