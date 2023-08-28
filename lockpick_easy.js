// For the latest Axiom VirtualNetwork+ scripting documentation, 
// please visit: http://www.zachtronics.com/virtualnetwork/

// VAR DECLARATIONS
    //HOSTS
    var playerHost,
        lockHost,
        secureHost,
    //LINKS
        playerHost_to_lockHost,
        lockHost_to_secureHost,
    //REGISTER VARS
        lockRegister,
        checkLockInput,
        checkLockInput_output,
        lockOutput,
    //FILE VARS
        file1,
        file1_data = [],
    //ACCESS VARS
        ACCESS_OPENED,
        key = [],
        keyDigits = [0,0,0,0],
        guess = [],
        guessDigits = [0,0,0,0],
    //MISC
        customGoal_1,
        customGoal_2,
        CUSTOM_1_COMPLETE = false,
        CUSTOM_2_COMPLETE = false;
        ;
//REQUIRED CONFIG FUNCTIONS
function getTitle(){return "X-PEL 1k Lockpicking (Easy)";};function getSubtitle(){return "by Ferrophage";};
function getDescription(){
    return "This is a basic lock that needs to be picked. Write a four digit code to #LOCK to input a code. Reading from #LOCK will return a four digit number.\n"
    +"Each digit in the value of #LOCK shows whether the digit in that postition is correct. A value of 1 indicates a correct digit. An input of 208 with code 248 will return 101.\n"
    +"Get into the secure host and bring file 301 back to your host. Please close the lock when you leave.";
}
function onCycleFinished(){
}
//MAIN
function initializeTestRun(testRun) {
    makeHostsandLinks()
    makeRegisters()
    makeFiles()
    initSecureAccess()
    setReqs()
}
//INSIDE MAIN LOOP
function makeHostsandLinks(){
    //HOSTS
    playerHost = getPlayerHost();
    lockHost = createHost("x-pel 1k", 5, 1, 3, 1);
    secureHost = createHost("secure", 10, 1, 2, 1);
    //LINKS
    playerHost_to_lockHost = createLink(playerHost, 800, lockHost, -1);
    lockHost_to_secureHost = createLink(lockHost, LINK_ID_NONE, secureHost, LINK_ID_NONE);
}
function makeRegisters(){
    lockRegister = createRegister(lockHost, 7,1,"LOCK")
    lockOutput = setRegisterReadCallback(lockRegister, lockOutputFunc)
    checkLockInput = setRegisterWriteCallback(lockRegister, checkInputFunc)
}
function initSecureAccess(){
    ACCESS_OPENED = false;
    key = randomInt(0, 6666)+3333;
    keyDigits = splitIntoDigits(key,keyDigits)
    guessDigits.length = 0
}
//FILE FUNCTIONS
function makeFiles(){
    for (let i=0 ; i<15 ; i++){
        file1_data[i] = randomName()
    }
    file1 = createNormalFile(secureHost,301,FILE_ICON_TEXT,file1_data)
    setFileColumnCount(file1,1)
}
//LOCK FUNCTIONS
function checkInputFunc(input){
    guess = input
    guessDigits = splitIntoDigits(guess,guessDigits)
}
function lockOutputFunc(){
    var output = 0
    for (i in guessDigits){
        if (guessDigits[i] == keyDigits[i]){
         output += Math.floor(Math.pow(10,3-i))
        }
    }
    if (output == 1111 && ACCESS_OPENED == false ){
        modifyLink(lockHost_to_secureHost,800,-1)
        ACCESS_OPENED = true
        setCustomGoalCompleted(customGoal_1)
        CUSTOM_1_COMPLETE = true
    }else if (output != 1111 && CUSTOM_1_COMPLETE == true){
        modifyLink(lockHost_to_secureHost,LINK_ID_NONE,LINK_ID_NONE)
        ACCESS_OPENED = false
        setCustomGoalCompleted(customGoal_2)
        CUSTOM_2_COMPLETE = true
    }
    guess.length = 0
    return output
}
//SETTING UP REQUIREMENTS
function setReqs(){
    customGoal_1 = requireCustomGoal("Pick the lock.")
    customGoal_2 = requireCustomGoal("Close the door behind you.")
    requireMoveFile(file1,playerHost,"Move file 301 to your host.")
}
//GENERAL FUNCTIONS
function splitIntoDigits(input, output){
    output = [0,0,0,0]
    for (i in [3,2,1,0]){
        if (i <= input.toString().length-1){
            output[i] = input.toString()[i]
        }
    }
    return output
}