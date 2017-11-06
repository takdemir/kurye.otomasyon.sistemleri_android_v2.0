/**
 * Created by taner on 14.11.2016.
 */

$(document).ready(function () {

    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    })

});



document.addEventListener("deviceready",onDeviceReadyForMyPanel,false);



<!--Device Ready Function-->
function onDeviceReadyForMyPanel(){

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
    });





    var callbackFn = function (location) {

        var regid = window.localStorage.getItem("regid");
        var kuryeID = window.localStorage.getItem("kuryeID");
        var latitude = location.latitude;
        var longitude = location.longitude;



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

        backgroundGeolocation.finish();

    };

    backgroundGeolocation.configure(callbackFn, failureFn, {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        url: window.localStorage.getItem("ipurl")+'/insertbackgroundposition',
        syncUrl: window.localStorage.getItem("ipurl")+'/insertbackgroundposition',
        httpHeaders: { 'X-FOO': 'bar' },
        maxLocations: 10000,
        // Android only section
        locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
        interval: 20000,
        stopOnTerminate: true,
        startOnBoot: true,
        startForeground: false,
        fastestInterval: 1000,
        activitiesInterval: 5000,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        notificationIconColor: '#FEDD1E',
        notificationIconLarge: 'mappointer_large',
        notificationIconSmall: 'mappointer_small',
        debug: true
    });



    backgroundGeolocation.start();























}




var mypanel={

    checklogin: function () {

        if(window.localStorage.getItem("kuryeID")=="" || window.localStorage.getItem("kuryeID")==null){
           window.location.href="login.html";
        }
    },
    logout: function () {
        window.localStorage.removeItem("kuryeID");
        window.localStorage.removeItem("kuryeName");
        window.localStorage.removeItem("ipurl");
        window.localStorage.removeItem("regid");
        window.location.href="login.html";
    },
    getjobsOnkurye: function (kuryeID) {

        var data={"kuryeID":kuryeID};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/getjobsonkurye",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a,b,c) {
                //alert("Hata: getonjobkurye" + a.responseText);
            },
            success: function (data) {



                    if(data.data!=""){

                        var table="";



                        var i = 1;
                        var y = 0;
                        $.each(data.data, function (k,v) {

                            var accordionOpen="";
                            if(i==1){
                               accordionOpen="";
                            }

                            var headId="heading"+i;
                            var collapseId="collapse"+i;

                                var color = "panel-default";
                                if(v.alimsaati!=""){color = "panel-warning";}
                                table+='<div class="panel '+color+'">'+


                                '<div class="panel-heading" role="tab" id="'+headId+'">'+
                                '<h4 class="panel-title">'+
                                '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#'+collapseId+'" aria-expanded="true" aria-controls="'+collapseId+'">'+
                                i+'.Gönderi ('+v.alinansemt+' - '+v.teslimsemt+')'+
                                '</a>'+
                                '</h4>'+
                                '</div>'+
                                '<div id="'+collapseId+'" class="panel-collapse collapse '+accordionOpen+'" role="tabpanel" aria-labelledby="'+headId+'">'+
                                '<div class="panel-body">'+

                                '<div class="panel panel-primary"><div class="panel-heading">ALINACAK</div><div class="panel-body">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Gönderi Nu.:</th>'+'<td>'+v.id+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Kişi</th>'+'<td>'+v.alinankisi+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Semt</th>'+'<td>'+v.alinansemt+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Alınacak Adres</th>'+'<td>'+v.alinanadres+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Tel:</th>'+'<td>'+v.kayitverencep+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Not1</th>'+'<td>'+v.not1+'</td>'+'</tr>'+
                                    '</table>'+
                                 '</div></div>'+
                                 '<div class="panel panel-primary"><div class="panel-heading">TESLİM EDİLECEK</div><div class="panel-body">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Teslim Ed.Kisi</th>'+'<td>'+v.teslimkisi+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Teslim Ed.Semt</th>'+'<td>'+v.teslimsemt+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Teslim Ed.Adres</th>'+'<td>'+v.teslimadres+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Tel:</th>'+'<td>'+v.f3cep+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Not3</th>'+'<td>'+v.not3+'</td>'+'</tr>'+
                                    '</table>'+
                                 '</div></div>'+
                                 '<div class="panel panel-primary"><div class="panel-heading">DİĞER BİLGİLER</div><div class="panel-body">'+
                                    '<table class="table table-bordered">'+
                                        '<tr>'+'<th>Tutar</th>'+'<td>'+v.tutar+' TL</td>'+'</tr>'+
                                        '<tr>'+'<th>İşlem Tipi</th>'+'<td>'+v.islemtipi+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Ödeme</th>'+'<td>'+v.odemedurumu+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Okuma Saati</th>'+'<td>'+v.okumasaati+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Yetkili</th>'+'<td>'+v.yetkiliname+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Yetkili Telefon</th>'+'<td>'+v.yetkilitel+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Kayıt Veren (F1):</th>'+'<td>'+v.kayitveren+'</td>'+'</tr>'+
                                        '<tr>'+'<th>Kayıt Veren Tel:</th>'+'<td>'+v.kayitverencep+'</td>'+'</tr>'+
                                        /*'<tr>'+'<th>F2 Tel.:</th>'+'<td>'+v.f2cep+'</td>'+'</tr>'+*/

                                        '<tr>'+'<td></td>'+'<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'alindi\','+(i-1)+')" class="btn btn-warning" value="Alındı" /> </td>'+'</tr>'+
                                        '<tr>'+'<td>' +
                                            '<input type="text" placeholder="Teslim Edilen" name="teslimEdilen" class="form-control" />' +
                                            '<input type="text" placeholder="Teslim Saati" name="teslimSaati" class="form-control" onclick="mypanel.getteslimsaati('+(i-1)+')" /> </td>'+
                                            '<td><input type="button" onclick="mypanel.executeonjob('+v.id+',\'teslim\','+(i-1)+')" class="btn btn-success" value="Teslim" /> </td>'+
                                        '</tr>'+
                                '</table>'+
                                    '</div></div>'+


                                '</div>'+
                                '</div>'+
                                '</div>';



                            i++;
                            y++;

                        });

                        $("#accordion").html("");

                        $("#accordion").html(table);

                        $("#uzerimdekiisCount").html(y);

                    }else{
                        $("#accordion").html("Üzerinizde iş bulunmamaktadır!");
                        $("#uzerimdekiisCount").html(0);
                    }

            }

        });
    },
    getdeliveredjobsOnkurye: function (kuryeID) {

        var data={"kuryeID":kuryeID};

        $.ajax({
            url: window.localStorage.getItem("ipurl")+"/getdeliveredjobsonkurye",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a,b,c) {
                //alert("Hata: getdeliveredjob" + a.responseText);
            },
            success: function (data) {



                if(data.data!=""){

                    var table="";



                    var i = 1;
                    var y = 0;
                    $.each(data.data, function (k,v) {

                        var accordionOpen="";
                        if(i==1){
                            accordionOpen="";
                        }

                        var headId="heading"+(i+100);
                        var collapseId="collapse"+(i+100);



                        table+='<div class="panel panel-default">'+


                            '<div class="panel-heading" role="tab" id="'+headId+'">'+
                            '<h4 class="panel-title">'+
                            '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#'+collapseId+'" aria-expanded="true" aria-controls="'+collapseId+'">'+
                            i+'.Teslimat'+
                            '</a>'+
                            '</h4>'+
                            '</div>'+
                            '<div id="'+collapseId+'" class="panel-collapse collapse '+accordionOpen+'" role="tabpanel" aria-labelledby="'+headId+'">'+
                            '<div class="panel-body">'+


                            '<table class="table table-bordered">'+
                            '<tr>'+'<th>Gönderi Nu.:</th>'+'<td>'+v.id+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Kişi</th>'+'<td>'+v.alinankisi+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Semt</th>'+'<td>'+v.alinansemt+'</td>'+'</tr>'+
                            '<tr>'+'<th>Al.Adres</th>'+'<td>'+v.alinanadres+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Kisi</th>'+'<td>'+v.teslimkisi+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Semt</th>'+'<td>'+v.teslimsemt+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tes.Adres</th>'+'<td>'+v.teslimadres+'</td>'+'</tr>'+
                            '<tr>'+'<th>Tutar</th>'+'<td>'+v.tutar+' TL</td>'+'</tr>'+
                            '<tr>'+'<th>İşlem Tipi</th>'+'<td>'+v.islemtipi+'</td>'+'</tr>'+
                            '<tr>'+'<th>Ödeme</th>'+'<td>'+v.odemedurumu+'</td>'+'</tr>'+
                            '<tr>'+'<th>Ok.Saati</th>'+'<td>'+v.okumasaati+'</td>'+'</tr>'+
                            '<tr>'+'<th>Alım Saati</th>'+'<td>'+v.alimsaati+'</td>'+'</tr>'+
                            '<tr>'+'<th>Teslim Saati</th>'+'<td>'+v.teslimsaati+'</td>'+'</tr>'+
                            '<tr>'+'<th>Teslim Alan</th>'+'<td>'+v.teslimalan+'</td>'+'</tr>'+
                            '<tr>'+'<th>Yetkili</th>'+'<td>'+v.yetkiliname+'</td>'+'</tr>'+
                            '<tr>'+'<th>Yetkili Telefon</th>'+'<td>'+v.yetkilitel+'</td>'+'</tr>'+
                            '<tr>'+'<th>Not</th>'+'<td>'+v.not+'</td>'+'</tr>'+
                            '<tr>'+'<th>Kayıt Veren (F1):</th>'+'<td>'+v.kayitveren+'</td>'+'</tr>'+
                            '<tr>'+'<th>Kayıt Veren Tel.:</th>'+'<td>'+v.kayitverencep+'</td>'+'</tr>'+
                            '<tr>'+'<th>F2 Tel.:</th>'+'<td>'+v.f2cep+'</td>'+'</tr>'+
                            '<tr>'+'<th>F3 Tel.:</th>'+'<td>'+v.f3cep+'</td>'+'</tr>'+
                            '<tr>'+'<th>İşlemi Geri al</th>'+
                            '<td><input type="button" onclick="mypanel.getjobback('+v.id+')" value="Geri al" class="btn btn-danger" /></td>'+
                            '</tr>'+
                            '</table>'+


                            '</div>'+
                            '</div>'+
                            '</div>';

                        i++;
                        y++;

                    });

                    $("#accordion2").html("");

                    $("#accordion2").html(table);

                    $("#teslimedilenisCount").html(y);

                }else{
                    $("#accordion2").html("Teslim Edilen iş bulunmamaktadır!");
                    $("#teslimedilenisCount").html(0);
                }

            }

        });
    },
    executeonjob: function (jobID,executetype,eq) {

        if(executetype=='alindi') {

            var data = {"islem": jobID, "action": "alındı"};

            $.ajax({
                url: window.localStorage.getItem("ipurl") + "/registerislemlerikurye",
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                beforeSend: function () {
                    //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
                },
                error: function (a, b, c) {
                    //alert("Hata: executejob" + a.responseText);
                },
                success: function (data) {

                    if(!data.hasError){

                        mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                        mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                        alert("Alındı bildirisi merkeze kaydedildi!");

                    }else{
                        alert("Alındı bildirilirken bir hata oluştu!");
                    }

                }

            });

        }else{

            var teslimEdilen=$("input[name='teslimEdilen']:eq(" + eq + ")").val();
            var teslimsaati=$("input[name='teslimSaati']:eq(" + eq + ")").val();
            if(teslimEdilen!="") {
                var data = {
                    "islem": jobID,
                    "action": "teslim",
                    "teslimalan": teslimEdilen,
                    "teslimsaati": teslimsaati
                };

                $.ajax({
                    url: window.localStorage.getItem("ipurl") + "/registerislemlerikurye",
                    type: "POST",
                    data: JSON.stringify(data),
                    dataType: "json",
                    beforeSend: function () {
                        //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" islem:"+jobID);
                    },
                    error: function (a, b, c) {
                        //alert("Hata:" + a.responseText);
                    },
                    success: function (data) {

                        if (!data.hasError) {

                            mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                            alert("İşlem teslim edildi!");

                        } else {
                            alert("Teslim edilirken bir hata oluştu!"+data.msg);
                        }
                    }

                });

            }else{
                alert("Teslim edilen kişiyi giriniz!");
            }

        }
        
    },
    getjobback: function (jobID) {

        var data = {
            "id": jobID
        };

        $.ajax({
            url: window.localStorage.getItem("ipurl") + "/teslimedilenisigerialkurye",
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function () {
                //alert("işler geliyor "+window.localStorage.getItem("ipurl")+" kuryeID:"+kuryeID);
            },
            error: function (a, b, c) {
                //alert("Hata: jobback" + a.responseText);
            },
            success: function (data) {

                if (!data.hasError) {

                    mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
                    mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));
                    alert("Teslimat geri alındı!");

                } else {
                    alert("İşlem geri alınırken bir hata oluştu!");
                }
            }

        });

    },
    getteslimsaati: function (eq) {

        var date=new Date();
        var day=date.getDate();
        var month=date.getMonth()+1;
        if(month<10){
            month="0"+month;
        }
        var year=date.getFullYear();
        var hour=date.getHours();
        if(hour<10){
            hour="0"+hour;
        }
        var minute=date.getMinutes();
        if(minute<10){
            minute="0"+minute;
        }
        var second=date.getSeconds();
        if(second<10){
            second="0"+second;
        }
        var teslimSaati=day+"-"+month+"-"+year+" "+hour+":"+minute+":"+second;
        $("input[name='teslimSaati']:eq("+eq+")").val(teslimSaati);
    },
    setlocations: function () {

        var regid = window.localStorage.getItem("regid");
        var kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!="" && kuryeID>0) {

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
                                //alert("hata:" + a.responseText);
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

                    if(PositionError.PERMISSION_DENIED){
                        common.showToast('Navigasyonunuza izin veriniz!','short','bottom',0);
                    }else if(PositionError.POSITION_UNAVAILABLE){
                        common.showToast('Navigasyonunuz açık değil!','short','bottom',0);
                    }else if(PositionError.TIMEOUT){
                        common.showToast('Navigasyonunuz üzerinden yerinize ulaşamıyorum!','short','bottom',0);
                    }


                },{enableHighAccuracy: true, timeout: 5000});


        }





    },
    setlocationswithwatch: function () {

        var regid = window.localStorage.getItem("regid");
        var kuryeID = window.localStorage.getItem("kuryeID");

        if(kuryeID!="" && kuryeID>0) {

            navigator.geolocation.watchPosition(function (position) {
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
                            //alert("hata:" + a.responseText);
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

                if(PositionError.PERMISSION_DENIED){
                    common.showToast('Navigasyonunuza izin veriniz!','short','bottom',0);
                }else if(PositionError.POSITION_UNAVAILABLE){
                    common.showToast('Navigasyonunuz açık değil!','short','bottom',0);
                }else if(PositionError.TIMEOUT){
                    common.showToast('Navigasyonunuz üzerinden yerinize ulaşamıyorum!','short','bottom',0);
                }


            },{enableHighAccuracy: true, timeout: 5000});


        }





    }
};




mypanel.checklogin();
mypanel.setlocations();
mypanel.setlocationswithwatch();

document.addEventListener("pause", onPause, false);
function onPause() {
    setInterval(function(){


        backgroundGeolocation.isLocationEnabled(function (enabled) {

            backgroundGeolocation.getLocations(function (locations) {
                //backgroundGeolocation.showLocationSettings();

                var a= "1";
                locations.forEach(function (loc) {
                    //if ((now - loc.time) <= sameDayDiffInMillis) {

                    //}
                    a +="2";
                });
                var now = Date.now();
                var sameDayDiffInMillis = 24 * 900 * 1000;
                //common.showToast(a,'long','center',0);
                var regid = window.localStorage.getItem("regid");
                var kuryeID = window.localStorage.getItem("kuryeID");
                var latitude = "-122.084";
                var longitude = "37.889900";



                if (latitude != "" && longitude != "") {

                    var data = {"regid": regid, "kuryeID": kuryeID, "latitude": latitude, "longitude": longitude,"locations":locations}
                    <!--Passing those values to the insertregid.php file-->
                    /*$.ajax({
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
                    });*/

                }

            });

        }, function () {
            backgroundGeolocation.showLocationSettings();
        });


    },5000);
    window.plugins.insomnia.keepAwake();

}



if(window.localStorage.getItem("kuryeID")!="" && window.localStorage.getItem("kuryeID")>0) {
    mypanel.getjobsOnkurye(window.localStorage.getItem("kuryeID"));
    mypanel.getdeliveredjobsOnkurye(window.localStorage.getItem("kuryeID"));

}


