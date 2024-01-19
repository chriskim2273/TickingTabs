import { Button } from '@chakra-ui/react'
import React from 'react'

const ResetHistoryButton = ({ setTabHistory }) => {
    const clearHistory = () => {
        chrome.storage.local.set({ 'tabHistory': {} }, function () {
            console.log('Tab History Cleared.');
        });
        setTabHistory({});
    }
    return (
        <Button colorScheme='red' onClick={() => clearHistory()}>Clear History</Button>
    )
}

export default ResetHistoryButton