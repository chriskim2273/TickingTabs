import { AbsoluteCenter, Box, Center, Divider, Input, InputGroup, InputLeftAddon, InputRightAddon, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

const UrlInput = ({ input, changeInput }) => {
    const [savedUrl, setSavedUrl] = useState("ENTER URL TO OPEN");
    useEffect(() => {
        chrome.storage.local.get(null, function (data) {
            if (data.urlToOpen !== undefined) {
                setSavedUrl(data.urlToOpen);
            }
        });
    })

    const updateUrlToOpen = (urlToOpen) => {
        changeInput(urlToOpen);
        chrome.storage.local.set({ 'urlToOpen': urlToOpen }, function () {
            console.log('URL to Open is set to ' + urlToOpen);
            chrome.runtime.sendMessage({ action: 'updateUrlToOpen', 'urlToOpen': urlToOpen });
        });
    }

    return (
        <>
            <Text> Change URL That Opens</Text>
            <InputGroup onChange={(event) => updateUrlToOpen("https://" + event.target.value)} size='sm'>
                <InputLeftAddon>
                    https://
                </InputLeftAddon>
                <Input variant='outline' placeholder={savedUrl.substring(8)} />
            </InputGroup>
        </>
    )
}

export default UrlInput