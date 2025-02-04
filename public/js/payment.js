var backButton = document.querySelector(".back-button");
var subtitle = document.querySelector(".main-title");

const successMsg = 'successful payment'
const unsuccessMsg = 'unsuccessful payment'
subtitle.textContent = GetQString('Status') === 'OK' ? successMsg:unsuccessMsg

function querySt(Key) {
    var url = window.location.href;
    KeysValues = url.split(/[\?&]+/); 
    for (i = 0; i < KeysValues.length; i++) {
            KeyValue= KeysValues[i].split("=");
            if (KeyValue[0] == Key) {

                return KeyValue[1];
        }
    }
}

function GetQString(Key) {     
    if (querySt(Key)) {
         const value = querySt(Key);

         return value;        
    }
 }

backButton.addEventListener("click", function(e) {
    isMobile();
});

var isMobile = function() {
    if(navigator.userAgent.match(/iPad/i)){
        //code for iPad here 
    }

    if(navigator.userAgent.match(/iPhone/i)){
        //code for iPhone here 
        console.log('iPhone here.');
    }
       
    if(navigator.userAgent.match(/Android/i)){
    //code for Android here 
        console.log('android here.');
    }
       
    if(navigator.userAgent.match(/BlackBerry/i)){
        //code for BlackBerry here 
    }
       
    if(navigator.userAgent.match(/webOS/i)){
        //code for webOS here 
    }
};