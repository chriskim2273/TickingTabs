import { Button } from '@chakra-ui/react'
import React from 'react'

const ResetHistoryButton = ({ setTabHistory }) => {
    const clearHistory = () => {
        chrome.storage.local.remove(['tabHistory'], () => {
            console.log("Tab history cleared..");
        });
        setTabHistory({});
    }
    return (
        <Button colorScheme='red' onClick={() => clearHistory()}>Clear History</Button>
    )
}

export default ResetHistoryButton