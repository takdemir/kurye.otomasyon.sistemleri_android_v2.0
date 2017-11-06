/**
 * Created by taner on 28.10.2017.
 */


document.addEventListener("deviceready",onDeviceReadyForAjaxjs,false);

<!--Device Ready Function-->
function onDeviceReadyForAjaxjs(){
    //alert("Device Ready");
    <!--Initializing Push Notification-->
    var push = PushNotification.init({

        <!--Setting attributes for Android, IOS and Windows-->
        android: {
            senderID: "809436805306"
        },
        ios: {
            alert: "true",
            badge: "true",
            sound: "true"
        },
        windows: {}
    });

    <!--This will alert registration ID which is returned by the GCM-->
    push.on('registration', function(data) {
        window.localStorage.setItem("regid",data.registrationId);
    });
    push.on('notification', function(data) {

        if(window.localStorage.getItem("kuryeID")!="" && window.localStorage.getItem("kuryeID")>0) {
            mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
            mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
        }

        navigator.notification.alert(
            data.message,         // message
            null,                 // callback
            data.title,           // title
            'Tamam'                  // buttonName
        );


        var beepsound = common.getpreferencebyname('beepsound');
        var vibratetime = common.getpreferencebyname('vibratetime');
        navigator.notification.beep(beepsound);
        navigator.notification.vibrate(vibratetime);


    });
    push.on('error', function(e) {
        common.showToast('Hata oluştu!');
    });


}


var login={

    sessionID: null,
    sessionName: null,
    sessionKuryeId: null,
    getipurl: "https://tbmsoft.xyz",

    getip: function () {

        var sirketid=$("#txt-sirketid").val();
        var data={"sirketid":sirketid};

        if(sirketid.trim()!="" && !isNaN(sirketid.trim())) {

            $.ajax({
                url: login.getipurl + "/getsirketip",
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                beforeSend: function () {
                    //alert("ip alınıyor"+login.getipurl);
                },
                error: function (a, b, c) {
                    alert("Hata:" + c);
                },
                success: function (data) {

                    if (!data.hasError) {
                        window.localStorage.setItem("ipurl", data.data);
                        login.login();
                    } else {
                        alert(data.msg);
                    }
                }

            });
        }else{
            common.showToast('Lütfen geçerli şirket numarası giriniz!');
        }

    },
    login: function () {

        var username=$("#txt-email").val();
        var password=$("#txt-password").val();
        var data={"username":username,"password":password};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/kuryelogin",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert(window.localStorage.getItem("ipurl"));
            },
            error: function (a,b,c) {
                common.showToast("Hata:" + a.responseText);
            },
            success: function (data) {

                if(!data.hasError){
                    login.opensession(data.data.id,data.data.kuryeAdi);
                    login.creategcm();

                }else{
                    common.showToast(data.msg,'short','center',0);
                }
            }

        });
    },
    opensession: function (sessionKuryeId,kuryeName) {

        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem("kuryeID",sessionKuryeId);
            window.localStorage.setItem("kuryeName",kuryeName);
            if(window.localStorage.getItem("kuryeID")>0 && window.localStorage.getItem("kuryeID")!=""){
                window.location.href="index.html";
            }else{
                common.showToast("Oturum açılamıyor. Lütfen yöneticinize başvurun!");
            }
        } else {

        }

    },

    creategcm: function () {

        var regid = window.localStorage.getItem("regid");
        var kuryeID = window.localStorage.getItem("kuryeID");
        var email = "";

        var data={"regid": regid,"kuryeID": kuryeID, "email":email}
        <!--Passing those values to the insertregid.php file-->
        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/insertregid",
            type: "POST",
            data: JSON.stringify(data),
            dataType:'json',
            beforeSend: function () {
                //alert(regid);
            },
            error: function (a,b,c) {
              common.showToast("hata:" + a.responseText);
            },
            success: function(data){
                //alert(data);
                if(!data.hasError){
                    return true;
                }
            }
        });

    },
    setlocations: function () {

        var regid = window.localStorage.getItem("regid");
        var kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!="" && kuryeID>0) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;



                    if (latitude != "" && longitude != "") {

                        var data = {"regid": regid, "kuryeID": kuryeID, "latitude": latitude, "longitude": longitude}
                        <!--Passing those values to the insertregid.php file-->
                        $.ajax({
                            url: window.localStorage.getItem("ipurl") + "/insertposition",
                            type: "POST",
                            data: JSON.stringify(data),
                            dataType: 'json',
                            beforeSend: function () {
                                //alert(regid);
                            },
                            error: function (a, b, c) {
                                alert("hata:" + a.responseText);
                            },
                            success: function (data) {
                                //alert(data);
                                if (!data.hasError) {
                                    return true;
                                }
                            }
                        });

                    }

                }, function () {

                },{enableHighAccuracy: true});
            }

        }





    },
    onError: function () {
        //alert("değişiklik yok");
    }

};


function callLocation() {
    login.setlocation();

}

//login.getip();
//setInterval("callLocation()",60000);