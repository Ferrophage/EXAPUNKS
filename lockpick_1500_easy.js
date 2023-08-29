// For the latest Axiom VirtualNetwork+ scripting documentation, 
// please visit: http://www.zachtronics.com/virtualnetwork/

// VAR DECLARATIONS
// I KNOW THERE ARE A LOT OF VARIABLES
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

        startingFileTargetData = [0],
 
        goalFile_FullString = "With my crossbow I shot the ALBATROSS PART II The Sun now rose upon the right",
        listofKeywords = "wealth player volume theory driver sample thanks recipe breath energy guitar method nation device studio "
                       + "affair potato effort dealer orange region dinner sector singer editor member speech safety throat aspect",
        keywordArray = [],
        TARGET_KEYWORD,
        targetKeywordIndex,
        activeFiles = [],
        activeFileIDs = [],
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
        CUSTOM_1_COMPLETE = false,
    //FLAGS
        ACCESS_OPENED,
        foundKeys = [false,false,false,false]//pretend this is four separate flags
        ;
    //CONSTANTS
  const startingFileID = 300,
        folderFileID = 301,
        goalFileID = 302,
        
        windowWidth = 40,
        windowHeight = 18,
        windowX = 90,
        windowY = 25
        ;
//REQUIRED CONFIG FUNCTIONS
function getTitle(){return "X-PEL 1500 Lockpicking (Easy)";};function getSubtitle(){return "by Ferrophage";};
function getDescription(){
    return "This lock requires four 4-digit numbers. Write a four digit code to #LOCK to input a code. Input 4 codes and write any value to the #ENTR register to test the codes. File 300 contains a keyword. The keyword is also found in one of the files in the DATA host. The codes for the lock are the four values immediately following the keyword. File 301 contains the IDs of the other four files in the DATA host.\n"
    +"Append the 4 codes to file 300 and leave it in your host. Create a different file with all of the data in file 302 and leave it in your host. I am going on a short vacation to celebrate completing this puzzle. Please feed the dog on your way out by writing any value to #FEED once you are done.";
}
function onCycleFinished(){
}
//MAIN
function initializeTestRun(testRun){
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
    lockHost = createHost("x-pel 1500", 5, 0, 3, 3);
    secureHost = createHost("secure", 10, 0, 3, 3);
    dataHost = createHost("data", 5, 5, 3, 3)
    //LINKS
    playerHost_to_lockHost = createLink(playerHost, 800, lockHost, -1);
    lockHost_to_dataHost = createLink(lockHost, 801, dataHost, -1)
    lockHost_to_secureHost = createLink(lockHost, LINK_ID_NONE, secureHost, LINK_ID_NONE);
}
function makeRegisters(){
    //lock
    lockRegister = createRegister(lockHost, 7,1,"LOCK")
    lockInput = setRegisterWriteCallback(lockRegister, lockInputFunc)
    currentInputCycle = 0
    //enter
    enterRegister = createRegister(lockHost, 7, 2,"ENTR")
    enterTrigger = setRegisterWriteCallback(enterRegister, resetLock)
    //feed the dog
    feedDogRegister = createRegister(lockHost,5,0,"FEED")
    feedDogTrigger = setRegisterWriteCallback(feedDogRegister, feedDog)
}
function initSecureAccess(){
    ACCESS_OPENED = false;
    //generate the codes
    for (let i = 0; i<keyNumbers.length; i+=1){
        keyNumbers[i] = makeKeyCode()
    }
}
//FILE FUNCTIONS
function makeFiles(){
    //create array from string (in var declarations at start) and then shuffle it
    keywordArray = shuffle(convertTextToKeywords(listofKeywords))
    //pick keyword
    targetKeywordIndex = randomInt(6,19)
    TARGET_KEYWORD = keywordArray[targetKeywordIndex]
    startingFile = createNormalFile(lockHost, startingFileID, FILE_ICON_TEXT,[TARGET_KEYWORD])
    //nested loops to create files and fill files with data
    for (let fileIterator = 0; fileIterator < 4 ; fileIterator+=1){
        //loops 4 times to make 4 files
        var fileID = (randomInt(1,20)+(20*fileIterator))+310
        activeFileIDs[fileIterator] = fileID
        thisFilesData = []
        var trueIndex = 0 // this is the index within the keywordArray 
        for (let keywordIterator = 0; keywordIterator < 5 ; keywordIterator+=1){
            //loops 5 times to make 5 entries in each file
            // KEYWORD  #### #### #### ####
            trueIndex = parseInt(keywordIterator) + parseInt(fileIterator*5)
            thisFilesData.push(keywordArray[trueIndex])
            for (let i = 0 ; i < 4; i+=1){
                if (trueIndex == targetKeywordIndex){
                    //if it's the keyword, put the keyNumbers after it
                    thisFilesData.push(keyNumbers[i])
                }else{
                    //if not, add random codes
                    thisFilesData.push(makeKeyCode())//if not, add random codes
                }
            }
        }
        var thisFile = createLockedFile(dataHost,fileID,FILE_ICON_SECURE,thisFilesData)
        setFileInitiallyCollapsed(thisFile)
        setFileColumnCount(thisFile,5)
        thisFilesData.length = 0
    }
    //make the folder containing the IDs of the other files
    folder = createLockedFile(dataHost,folderFileID,FILE_ICON_FOLDER,activeFileIDs)
    setFileColumnCount(folder,1)
    //make the goal file in the secure host
    makeGoalFileData()
    goalFile = createNormalFile(secureHost, goalFileID, FILE_ICON_ARCHIVE, goalFileData)
}
function makeGoalFileData(){
    goalFileData = convertTextToKeywords(goalFile_FullString)
}
//REGISTER FUNCTIONS
    //LOCK FUNCTIONS
function lockInputFunc(input){
    var intInput = parseInt(input)
    if (currentInputCycle < 4){
        //check input against the code, if it matches set flag to true
        if (intInput == keyNumbers[currentInputCycle]){
            foundKeys[currentInputCycle] = true
        }
        //populate guessNumbers
        guessNumbers[currentInputCycle] = intInput
        //this loop extends guesses under 4 digits (ex "25") to four digits ("0025") for display
        var tempStr = input.toString()
        for (;tempStr.length<4;){
            tempStr = "0"+tempStr
        }
        displayArray[currentInputCycle] = tempStr
        //increment the cycle counter
        currentInputCycle+=1
    }
    //display results of the input
    printAllTextInWindow()
}
function resetLock(){
    if (evalFoundKeys() == true/*this returns true if all four foundKey flags are true*/){
        ACCESS_OPENED = true // flag for feeding the dog later
        modifyLink(lockHost_to_secureHost,800,-1) //open the link
    }else{
        //resets foundKey flags
        for (i in foundKeys){
            foundKeys[i] = false
        }
        //clear screen display of codes
        clearDisplayArray()
        //clears guessNumbers, a little slower than setting length to 0 but i want this array to stay the same size.
        for (i in guessNumbers){
            guessNumbers[i] = 0
        }
        //reset input cycle
        currentInputCycle = 0
    }
    //update the screen
    printAllTextInWindow()
}
//returns bool
function evalFoundKeys(){
    //loops through found keys flags and returns false if any are not true
    for (let i = 0; i < foundKeys.length ; i+=1){
        if (foundKeys[i] != true){
            return false
        }
    }
    //only falls through to this if the for loop never returns false
    return true
}
//DOG FEED FUNCTION
function feedDog(){
    if (ACCESS_OPENED == true){
        setCustomGoalCompleted(customGoal_1)
    }
}
//////SETTING UP REQUIREMENTS
function setReqs(){
    makeStartingFileTargetData()
    requireMoveAndChangeFile(startingFile,playerHost,startingFileTargetData,"Append the keys to file 300 and leave it in your host.")
    requireCreateFile(playerHost,goalFileData,"Copy data from file 302 to a new file, and leave that file in your host.")
    customGoal_1 = requireCustomGoal("Feed the dog on your way out.")
}
function makeStartingFileTargetData(){
    startingFileTargetData.length = 0
    startingFileTargetData[0] = TARGET_KEYWORD
    for (let i = 0 ; i < keyNumbers.length ; i+=1){
        //for some reason this was getting parsed as a string at one point
        startingFileTargetData[parseInt(i) + 1] = parseInt(keyNumbers[i])
    }
}
//////DISPLAY WINDOW
function makeWindow(){
    lockDisplayWindow = createWindow("X-PEL 1500 API 0.1.4",windowX,windowY,windowWidth,windowHeight)
    printAllTextInWindow()
}
//draw all text, now in one function
function printAllTextInWindow(){
    clearWindow(lockDisplayWindow)
    printWindow(lockDisplayWindow,"welcome to the x-pel 1.5k api 0.1.4".toUpperCase())
    printWindow(lockDisplayWindow,"")
    var horizontalSpacer = '   | '
    printWindow(lockDisplayWindow,"")
    printWindow(lockDisplayWindow,"Current Input Cycle: ".concat(currentInputCycle))
    printWindow(lockDisplayWindow,"")
    //draws the displayArray to the screen
    var outputString
    for (let i = 0; i < displayArray.length ; i+=1){
        outputString = horizontalSpacer+displayArray[i]+" |"
        //pointer for current location
        if (i == currentInputCycle){
            outputString = outputString+ " <"
        }
        printWindow(lockDisplayWindow,outputString)
    }
    printWindow(lockDisplayWindow,"")
    //displays [LOCKED] until unlocked, when it says "[UNLOCKED]"
    var temp=''
    if(ACCESS_OPENED == true){
        temp = "UN"
    }
    printWindow(lockDisplayWindow,"Status: ["+temp+"LOCKED]")
}
function clearDisplayArray(){
    for (i in displayArray){
        displayArray[i] = "----"
    }
}
//////GENERAL FUNCTIONS
//returns a 4 digit number for use as a code
function makeKeyCode(){
    return randomInt(0, 8499)+1500
}
//shuffles input array and returns it
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