// For the latest Axiom VirtualNetwork+ scripting documentation, 
// please visit: http://www.zachtronics.com/virtualnetwork/

// VAR DECLARATIONS
    //HOSTS
    var playerHost,
        lockHost,
        secureHost,
        dataHost,
        //LINKS
        playerHost_to_lockHost,
        lockHost_to_secureHost,
        lockHost_to_dataHost,
    //REGISTER VARS
        lockRegister,
        enterRegister,        
        feedDogRegister,
        lockInput,
        lockInput_output,
        lockOutput,
        currentInputCycle,

    //FILE VARS
        folder,
        folder_data = [],
        startingFile = [],
        startingFileID = 300,
        startingFileTargetData = [0],
        activeFiles = [],
        activeFileIDs = [],
        listofKeywords = "wealth player volume theory driver sample thanks recipe breath energy guitar method nation device studio "
                       + "affair potato effort dealer orange region dinner sector singer editor member speech safety throat aspect",
        keywordArray = [],
        TARGET_KEYWORD,
        targetKeywordIndex,
        ACCESS_OPENED,
        keyNumbers = [0,0,0,0],
        guessNumbers = [],
        thisFilesData,
        goalFile,
        goalFileData = [],
    //WINDOW VARS
        lockInputWindow,
        displayArray = ["----","----","----", "----"],
    //MISC
        customGoal_1,
        customGoal_2,
        CUSTOM_1_COMPLETE = false,
        CUSTOM_2_COMPLETE = false,
    //FLAGS
        HAS_SEEN_WELCOME = false,
        foundKeys = [false,false,false,false]
    //KEYWORDS
        ;
//REQUIRED CONFIG FUNCTIONS
function getTitle(){return "X-PEL 1.5k Lockpicking (Easy)";};function getSubtitle(){return "by Ferrophage";};
function getDescription(){
    return "Writing a four digit code to #LOCK will input that code. Input 4 codes and write any value to the #ENTR register to test the codes.\n"
    +"File 301 contains the IDs of the other four files in the DATA host. File 300 contains a keyword. One of the files in the DATA host contains the keyword. The key to the lock is the four values immediately following the keyword.\n"
    +"Append the 4 key values to file 300 and leave it in your host. Create a different file with all of the data in file 302 and leave it in your host. I am going on a short vacation to celebrate completing this puzzle. Please ";
}
function onCycleFinished(){
}
//MAIN
function initializeTestRun(testRun){
    currentInputCycle = 0
    clearDisplayArray()
    makeHostsandLinks()
    makeRegisters()
    makeFiles()
    setReqs()
    initSecureAccess()
    makeWindow()
}
//INSIDE MAIN LOOP
function makeHostsandLinks(){
    //HOSTS
    playerHost = getPlayerHost();
    lockHost = createHost("x-pel 2k", 5, 0, 3, 3);
    secureHost = createHost("secure", 10, 0, 3, 3);
    dataHost = createHost("data", 5, 5, 3, 3)
    //LINKS
    playerHost_to_lockHost = createLink(playerHost, 800, lockHost, -1);
    lockHost_to_dataHost = createLink(lockHost, 801, dataHost, -1)
    lockHost_to_secureHost = createLink(lockHost, LINK_ID_NONE, secureHost, LINK_ID_NONE);
}
function makeRegisters(){
    lockRegister = createRegister(lockHost, 7,1,"LOCK")
    //lockOutput = setRegisterReadCallback(lockRegister, lockOutputFunc)
    lockInput = setRegisterWriteCallback(lockRegister, lockInputFunc)

    enterRegister = createRegister(lockHost, 6, 0,"ENTR")
    enterTrigger = setRegisterWriteCallback(enterRegister, resetLock)

    feedDogRegister = createRegister(lockHost,5,2,"FEED")
    feedDogTrigger = setRegisterWriteCallback(feedDogRegister, feedDog)

}
function initSecureAccess(){
    ACCESS_OPENED = false;
    for (let i = 0; i<keyNumbers.length; i+=1){
        keyNumbers[i] = makeKeyCode()
    }
}
//FILE FUNCTIONS
function makeFiles(){
    keywordArray = shuffle(convertTextToKeywords(listofKeywords))
    targetKeywordIndex = randomInt(6,19)
    TARGET_KEYWORD = keywordArray[targetKeywordIndex]
    startingFile = createNormalFile(lockHost, startingFileID, FILE_ICON_TEXT,[TARGET_KEYWORD])
    //nested loops to create files and fill files with data
    for (let fileIterator = 0; fileIterator < 4 ; fileIterator+=1){
        //loops 4 times to make 4 files
        var fileID = (randomInt(1,20)+(20*fileIterator))+310
        activeFileIDs[fileIterator] = fileID
        thisFilesData = []
        var trueIndex = 0
        for (let keywordIterator = 0; keywordIterator < 5 ; keywordIterator+=1){
            //loops 5 times to make 5 entries in each file
            // KEYWORD  #### #### #### ####
            trueIndex = parseInt(keywordIterator) + parseInt(fileIterator*5)
            thisFilesData.push(keywordArray[trueIndex])
            for (let i = 0 ; i < 4; i+=1){
                if (trueIndex == targetKeywordIndex){
                    thisFilesData.push(keyNumbers[i])
                }else{
                    thisFilesData.push(makeKeyCode())
                }
            }
        }
        var thisFile = createLockedFile(dataHost,fileID,FILE_ICON_SECURE,thisFilesData)
        setFileInitiallyCollapsed(thisFile)
        setFileColumnCount(thisFile,5)
        thisFilesData.length = 0
    }
    folder = createLockedFile(dataHost,301,FILE_ICON_FOLDER,activeFileIDs)
    setFileColumnCount(folder,1)
    
    makeGoalFileData()
    goalFile = createNormalFile(secureHost, 302, FILE_ICON_ARCHIVE, goalFileData)
}
function makeGoalFileData(){
    goalFileData = convertTextToKeywords("'God save thee, ancient Mariner! From the fiends, that plague thee thus! Why look'st thou so?' - With my crossbow I shot the ALBATROSS. PART II The Sun now rose upon the right")
}

//REGISTER FUNCTIONS
    //LOCK FUNCTIONS
function lockInputFunc(input){
    var intInput = parseInt(input)
    if (currentInputCycle < 4){
        if (intInput == keyNumbers[currentInputCycle]){
            foundKeys[currentInputCycle] = true
        }
        guessNumbers[currentInputCycle] = intInput
        var tempStr = input.toString()
        for (;tempStr.length<4;){
            tempStr = "0"+tempStr
        }
        displayArray[currentInputCycle] = tempStr
        currentInputCycle+=1
    }
    printAllTextInWindow()
}
function resetLock(){
    if (evalFoundKeys()){
        ACCESS_OPENED = true
        setCustomGoalCompleted(customGoal_1)
        modifyLink(lockHost_to_secureHost,800,-1)
    }else{
        for (i in foundKeys){
            foundKeys[i] = false
        }
        clearDisplayArray()
        for (i in guessNumbers){
            guessNumbers[i] = 0
        }
        currentInputCycle = 0
    }
    printAllTextInWindow()
}
function evalFoundKeys(){
    //loops through found keys flags and returns false if any are not true
    for (let i = 0; i < foundKeys.length ; i+=1){
        if (foundKeys[i] != true){
            return false
        }
    }
    return true
}
    //DOG FEED FUNCTION
function feedDog(){
    if (CUSTOM_1_COMPLETE == true){
        setCustomGoalCompleted(customGoal_2)
    }
}


//SETTING UP REQUIREMENTS
function setReqs(){
    //customGoal_1 = requireCustomGoal("Open the lock.")
    makeStartingFileTargetData()
    requireMoveAndChangeFile(startingFile,playerHost,startingFileTargetData,"Append the keys to file 300 and leave it in your host.")
    requireCreateFile(playerHost,goalFileData,"Copy data from file 302 to a new file, and leave that file in your host.")
    //mergeRequirements(2, "Make changes to the appropriate files.")
    customGoal_2 = requireCustomGoal("Feed the dog on your way out.")
    //requireMoveFile(file1,playerHost,"Move file 301 to your host.")
}
function makeStartingFileTargetData(){
    startingFileTargetData.length = 0
    startingFileTargetData[0] = TARGET_KEYWORD
    for (let i = 0 ; i < keyNumbers.length ; i+=1){
        startingFileTargetData[parseInt(i) + 1] = parseInt(keyNumbers[i])
    }
}
//DISPLAY WINDOW
function makeWindow(){
    var windowWidth = 40;
    var windowHeight = 18;
    lockDisplayWindow = createWindow("X-PEL 1.5K API 0.1.3", 90,25,windowWidth,windowHeight)
    printAllTextInWindow()
}
function printAllTextInWindow(){
    clearWindow(lockDisplayWindow)
    playWelcome()
    var horizontalSpacer = '   | '
    printWindow(lockDisplayWindow,"")
    printWindow(lockDisplayWindow,"Current Input Cycle: ".concat(currentInputCycle))
    printWindow(lockDisplayWindow,"")
    var outputString
    for (let i = 0; i < displayArray.length ; i+=1){
        outputString = horizontalSpacer+displayArray[i]+" |"
        if (i == currentInputCycle){
            outputString = outputString+ " <"
        }
        printWindow(lockDisplayWindow,outputString)
    }
    printWindow(lockDisplayWindow,"")
    var temp
    if(ACCESS_OPENED == true){
        temp = "[UNLOCKED]"
    }else{
        temp = "[LOCKED]"
    }
    printWindow(lockDisplayWindow,"Status: ".concat(temp))
}
function clearDisplayArray(){
    for (i in displayArray){
        displayArray[i] = "----"
    }
}
function playWelcome(){
    printWindow(lockDisplayWindow,"welcome to the x-pel 1.5k api 0.1.3".toUpperCase())
    HAS_SEEN_WELCOME = true
    printWindow(lockDisplayWindow,"")
}
//GENERAL FUNCTIONS
function makeKeyCode(){
    return randomInt(0, 6999)+3000
}
function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;
    while (i--) {
        j = randomInt(0,i+1);
        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}