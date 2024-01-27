import { NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

const TimerInput = ({ input, changeInput }) => {
    const [savedTime, setSavedTime] = useState(30);
    useEffect(() => {
        chrome.storage.local.get(null, function (data) {
            if (data.savedTime !== undefined) {
                setSavedTime(data.savedTime);
            }
        });
    }, [input])

    const updateSavedTimeLcl = (time) => {
        changeInput(time);
        chrome.storage.local.set({ 'savedTime': time }, function () {
            console.log('Time tabs last for set to: ' + time);
            chrome.runtime.sendMessage({ action: 'updateTabTime', 'time': time });
        });
    }

    return (
        <>
            <Text> Change How Long Tabs Last For (Seconds) </Text>
            <NumberInput onChange={(_, time) => {
                updateSavedTimeLcl(time * 1000);
            }} step={1} defaultValue={input} min={1} max={86400}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </>
    )
}

export default TimerInput;