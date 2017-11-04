function Common() {

    this.setlocation = function () {

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


    };


    this.showToast = function (message,duration,position,addPixelsY) {

        window.plugins.toast.showWithOptions(
            {
                message: message,
                duration: duration, // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: position,
                addPixelsY: addPixelsY  // added a negative value to move it up a bit (default 0)
            }
        );
        
    };


    this.setpreferences = function () {

        var beepsound = $('#beepsound').val();
        if(beepsound=="" || beepsound==0 || isNaN(beepsound)){
            common.showToast('Mesaj tekrarı, sayı ve sıfırdan büyük olmak zorundadır!','long','center',0);
            return false;
        }else{
            window.localStorage.setItem('beepsound',beepsound);
        }
        var vibratetime = $('#vibratetime').val();
        if(vibratetime=="" || vibratetime==0 || isNaN(vibratetime)){
            common.showToast('Titreşim süresi, sayı ve sıfırdan büyük olmak zorundadır!','long','center',0);
            return false;
        }else{
            window.localStorage.setItem('vibratetime',vibratetime*1000);
            common.showToast('Başarılı olarak kaydedildi!','long','center',0);
        }

    };


    this.getpreferencebyname = function (preferencename) {

        if(preferencename=='beepsound'){

            var beepsound = 1;
            if(window.localStorage.getItem('beepsound')!="" && window.localStorage.getItem('beepsound')>0){
                beepsound = window.localStorage.getItem('beepsound');
            }

            return beepsound;

        }else if(preferencename=='vibratetime'){
            var vibratetime = 1;
            if(window.localStorage.getItem('vibratetime')!="" && window.localStorage.getItem('vibratetime')>0){
                vibratetime = window.localStorage.getItem('vibratetime');
            }

            return vibratetime;
        }
    };










}

var common = new Common();