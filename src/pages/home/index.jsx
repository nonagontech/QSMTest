import React, { useEffect, useState } from "react";
import { Button } from "antd";
import "./index.less";

const SDK = require('qsm-otter-sdk')
const Home = () => {
  const pairInstrument = async () => {
    console.log('pairInstrument start');
    const port = await SDK.pairInstrument()

    console.log("paired instrument", port)
  }
  const readConnectionStatus = async () => {
    console.log('readConnectionStatus start');
    const port = await SDK.readConnectionStatus()
    console.log("readConnectionStatus", port)
  }
  return (
    <>
      <Button type="primary" onClick={pairInstrument}>pairInstrument</Button>
      <Button type="primary" onClick={readConnectionStatus}>readConnectionStatus</Button>
    </>

  );
};

export default Home;
