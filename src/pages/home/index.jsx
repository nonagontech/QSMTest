import React, { useEffect, useState } from "react";
import { Button } from "antd";
import "./index.less";

const SDK = require('qsm-otter-sdk')
const ipcRenderer = window.require("electron").ipcRenderer;
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
  //检测USB设备发来的信息
  const _send = (e, data) => {
    console.log('data', data)
  };
  useEffect(() => {
    //检测USB设备发来的信息
    ipcRenderer.on("sned", _send);
    return () => {
      ipcRenderer.removeListener("sned", _send);
    }
  }, [])
  return (
    <>
      <Button type="primary" onClick={pairInstrument}>pairInstrument</Button>
      <Button type="primary" onClick={readConnectionStatus}>readConnectionStatus</Button>
    </>

  );
};

export default Home;
