/* THIS IS NOT FINISHED AND PROBABLY WILL NOT RUN WITHOUT ERRORS */

// For the latest Axiom VirtualNetwork+ scripting documentation, 
// please visit: http://www.zachtronics.com/virtualnetwork/
//VARS

    //HOSTS
    var playerHost,
        inboxHost,
        //outboxHost,
        corrupt1,
        corrupt2;
        /*loopHost1,
        loopHost2,
        loopHost3;*/

    //FILES
    var activeFiles = [];

    //FILE DATA
    var originalData = [[],[]],
        amountCorrupted = [[],[]],
        corruptionPattern = [[],[],[],[]];
    
function getTitle(){
    return "Double Trouble (Medium)";
}
function getSubtitle(){
    return "by Ferrophage";
}
function getDescription(){
    return "This poorly constructed storage drive is failing. Drives 1 and 2 contain copies of the same 2 files (301 and 302).\n"
    +"However, some of the data is corrupted. The same data will never be corrupted on both drives.\n"
    +"1) Repair all corrupted data in all four original files.\n"
    +"2) Create 2 files that contain the repaired data in files 301 and 302 and leave them in your host.\n"
    +"This is my first puzzle in EXAPUNKS. The medium difficulty will probably include a lock.";
}

//main function
function initializeTestRun(testRun){
    printConsole("init test run...")
    makeHostsandLinks();
    initFiles();
    setGoals();
}

//fires when test run is over? seems a little niche
function onCycleFinished(){}

function makeHostsandLinks(){
    /* commented out code was learning how to create stuff. it might come back
    in a later edition of this puzzle */
    
    playerHost = getPlayerHost()
    inboxHost = createHost("mainframe", 5, 0, 3, 3);
    //outboxHost = createHost("outbox", 5, -5, 3, 3);
    //FILES HERE ARE DUPLICATES OF EACH OTHER, MAYBE CORRUPTED?
    corrupt1 = createHost("drive 1", 10, 2, 3, 1);
    corrupt2 = createHost("drive 2", 10, 0, 3, 1);
    /*
    //LOOP HOSTS
    loopHost1 = createHost("loop-1", 10, 0, 3, 3);
    loopHost2 = createHost("loop-2", 15, 0, 3, 3);
    loopHost3 = createHost("loop-3", 12, 5, 4, 2);
    */

    //inbox links
    createLink(inboxHost, 800, corrupt1, -1);
    createLink(inboxHost, 801, corrupt2, -1);
    /*
    //outbox links
    createLink(outboxHost, 800, corrupt1, -1);
    createLink(outboxHost, 801, corrupt2, -1);
    //loop-1 links
    createLink(loopHost1,800,loopHost2,-1);
    createLink(loopHost1,-1,loopHost3,800);
    //loop-2 links
    createLink(loopHost2,800,loopHost3,-1);*/
}

function initFiles(){
    genData(originalData[0])
    genData(originalData[1])

    //corrupt stuff
    for(i in [0,1]){
    amountCorrupted[i] = randomInt(10,30)
    }
    var tempArray = [0,2]
    for (key in tempArray){
        corruptionPattern[tempArray[key]] = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
    }
    corruptionPattern[0] = corruptionPattern[0].splice(0,amountCorrupted[0])
    corruptionPattern[2] = corruptionPattern[2].splice(0,amountCorrupted[1])
    //i don't know how to optimize this because of the matrix multiplication
    //i'm sure it can be done but i do not know where to even start
    corruptionPattern[1] = corruptionPattern[0].splice(0, amountCorrupted[0]/2)
    corruptionPattern[3] = corruptionPattern[2].splice(0, amountCorrupted[1]/2)

    activeFiles[0] = createLockedFile(
        corrupt1,//host
        301,//id
        FILE_ICON_ARCHIVE,//icon
        corruptData(originalData[0],corruptionPattern[0]))//contents
    activeFiles[1] = createLockedFile(
        corrupt2,//host
        301,//id
        FILE_ICON_ARCHIVE,//icon
        corruptData(originalData[0],corruptionPattern[1]))//contents
    activeFiles[2] = createLockedFile(
        corrupt1,//host
        302,//id
        FILE_ICON_ARCHIVE,//icon
        corruptData(originalData[1],corruptionPattern[2]))//contents
    activeFiles[3] = createLockedFile(
        corrupt2,//host
        302,//id
        FILE_ICON_ARCHIVE,//icon
        corruptData(originalData[1],corruptionPattern[3]))//contents

    //column count settings
    for (key in activeFiles){
        setFileColumnCount(activeFiles[key],2)
        setFileInitiallyCollapsed(activeFiles[key])
    }
}

function corruptData(inputArray,corruptionPattern){
    var temp = inputArray.slice()
    for (key in corruptionPattern){
        temp.splice(corruptionPattern[key],1,-9999)
    }
    return temp
}

function setGoals(){
    requireChangeFile(activeFiles[0],originalData[0],"Fix all corruption")
    requireChangeFile(activeFiles[1],originalData[0],"Fix all corruption")
    requireChangeFile(activeFiles[2],originalData[1],"Fix all corruption")
    requireChangeFile(activeFiles[3],originalData[1],"Fix all corruption")
    mergeRequirements(4,"Fix all original files")
    requireCreateFile(playerHost, originalData[0], "Recover 301 Data")
    requireCreateFile(playerHost, originalData[1], "Recover 302 Data")
    mergeRequirements(2,"Recover both files")
}

//GENERATOR FUNCIONS
function genData(array){
    array.length = 0
    for(let i = 0; i <= 10;i++){
        array.push(randomName())
        array.push(randomAddress())
    }
}

//GENERAL PURPOSE FUNCTIONS
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
