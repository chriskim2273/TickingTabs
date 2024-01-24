/// <reference types="chrome"/>
import { useEffect, useState } from "react";
import "./App.css"
import { AbsoluteCenter, Box, Button, Center, Divider, Kbd, Stack, Text } from "@chakra-ui/react";
import UrlInput from "./UrlInput";
import ResetHistoryButton from "./ResetHistoryButton";

const MainApp = ({ rerender }) => {
    const [TabData, setTabData] = useState({});
    const [TabHistory, setTabHistory] = useState({})
    const [tabHistoryComponent, setTabHistoryComponent] = useState(<></>);
    const [urlInput, setUrlInput] = useState("");
    const [stayAwake, setStayAwake] = useState(false);

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
            case 'timerEnded':
                setStayAwake(false);
                break;
            case 'timerStarted':
                console.log("start!")
                setStayAwake(true);
                break;
        }
    });

    useEffect(() => {
        let intervalId;

        if (stayAwake) {
            intervalId = setInterval(() => {
                chrome.runtime.sendMessage({ action: 'wakeUp' });
            }, 5000); // 5000 milliseconds = 5 seconds
        }

        // Cleanup function to clear the interval when the component unmounts or isActive changes
        return () => clearInterval(intervalId);
    }, [stayAwake])

    useEffect(() => {
        //chrome.runtime.sendMessage({ action: 'getTabs' });
        //chrome.runtime.sendMessage({ action: 'getTabHistory' });
        chrome.storage.local.get(null, function (data) {
            if (data.tabHistory !== undefined) {
                const tabHistoryJSON = JSON.parse(data.tabHistory);
                if (Object.keys(tabHistoryJSON).length > 0) {
                    console.log(tabHistoryJSON);
                    setTabHistory(tabHistoryJSON);
                }
            }
        });
    }, [])
    useEffect(() => {
        rerender();
    }, [TabData, TabHistory])

    const openTab = (url) => {
        chrome.runtime.sendMessage({ action: 'openTab', url: url });
    }


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
                Open Ticking Tab:   <Kbd>alt</Kbd> + <Kbd>1</Kbd> or <Kbd>Option</Kbd> + <Kbd>1</Kbd>
            </Center>
            <Center>
                Perpetuate Ticking Tab:   <Kbd>alt</Kbd> + <Kbd>2</Kbd> or <Kbd>Option</Kbd> + <Kbd>2</Kbd>
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
                <Stack>
                    {Object.keys(TabHistory).map((key, index) => {
                        return (
                            <Center key={`tab-history-${index}`}>
                                <Button onClick={() => { openTab(TabHistory[key].url) }} colorScheme='teal' variant='outline'>{JSON.stringify(TabHistory[key].title)}</Button>
                            </Center>
                        )
                    })}
                </Stack>
            </Box>
        </Box>
    );
}

export default MainApp;
