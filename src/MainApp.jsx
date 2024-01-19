/// <reference types="chrome"/>
import { useEffect, useState } from "react";
import "./App.css"
import { AbsoluteCenter, Box, Center, Divider, Kbd, Text } from "@chakra-ui/react";
import UrlInput from "./UrlInput";
import ResetHistoryButton from "./ResetHistoryButton";

const MainApp = ({ rerender }) => {
    const [TabData, setTabData] = useState({});
    const [TabHistory, setTabHistory] = useState({})
    const [tabHistoryComponent, setTabHistoryComponent] = useState(<></>);
    const [urlInput, setUrlInput] = useState("");

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.action) {
            case 'tabRemoved':
                //setTabHistory(message.tabInfo);
                break;
            case 'sendTabs':
                setTabData(message.tabInfo);
                break;
            case 'sendTabHistory':
                setTabHistory(message.tabInfo);
                break;
        }
    });

    useEffect(() => {
        //chrome.runtime.sendMessage({ action: 'getTabs' });
        //chrome.runtime.sendMessage({ action: 'getTabHistory' });
        chrome.storage.local.get(null, function (data) {
            if (data.tabHistory !== undefined) {
                setTabHistory(data.tabHistory);
            }
        });
    }, [])
    useEffect(() => {
        rerender();
    }, [TabData, TabHistory])
    return (
        <Box>
            <UrlInput input={urlInput} changeInput={setUrlInput} />
            <Box position='relative' padding='5'>
                <Divider />
                <AbsoluteCenter bg='white' px='4'>
                    Binds
                </AbsoluteCenter>
            </Box>
            <Center>
                Open Ticking Tab:   <Kbd>alt</Kbd> + <Kbd>1</Kbd>
            </Center>
            <Center>
                Perpetuate Ticking Tab:   <Kbd>alt</Kbd> + <Kbd>1</Kbd>
            </Center>
            <Box position='relative' padding='5'>
                <Divider />
                <AbsoluteCenter bg='white' px='4'>
                    TickingTab History
                </AbsoluteCenter>
            </Box>
            <ResetHistoryButton setTabHistory={setTabHistory} />
            <Box
                overflowY="auto"
                maxH="300px"
                sx={{
                    "::-webkit-scrollbar": {
                        width: "10px",
                    },
                    "::-webkit-scrollbar-track": {
                        bg: "gray.100",
                    },
                    "::-webkit-scrollbar-thumb": {
                        bg: "gray.400",
                    },
                }}
            >
                <Text>{JSON.stringify(TabHistory)}</Text>
            </Box>
        </Box>
    );
}

export default MainApp;
