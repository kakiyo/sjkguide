var map;
var geocoder;
var address;
var markers = [];
var myLocation;

function initMap() {
    //マップを生成
    map = new google.maps.Map(document.getElementById('map_canvas'), {
        //初期設定。新宿に座標を合わせる。
        zoom: 15,
        center: new google.maps.LatLng(35.6898191, 139.7003084),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    geocoder = new google.maps.Geocoder;


    google.maps.event.addListener(map, 'click', function () {
        //インフォウィンドウを消去
    });
}




// 位置取得
function geolocation() {
    if(myLocation){
        myLocation.setMap(null);

    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            map.setZoom(18);
            myLocation = new google.maps.Marker({
                position: pos,
                map: map,
                animation: google.maps.Animation.DROP,
                icon:'icon/ren.png'
            });

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }
}


function ajaxSubmit() {

    // マークを消す
    deleteMarkers();
    // $(function () {
    //     if (destination)
    //         destination.setMap(null);
    // });
// 目的地をゲット
    if (document.getElementById("address").value) {
        address = document.getElementById("address").value;
    }
    else {
        alert("場所を入力してくだいさい");
        return
    }
   geolocateAjax();
    $("#show").css("display","inline");
}

function geolocateAjax() {
    if (geocoder) {
        geocoder.geocode({
                'address': address,
                'region': 'jp',
                'bounds': {north: 35.6957527,east: 139.7092613,south: 35.6846075, west: 139.6898095}
            },
            function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {

                    var latlng = results[0].geometry.location;
                    map.setCenter(latlng);
                    map.setZoom(15);
                    // console.log(results);
                    var circle= new google.maps.Circle({
                        strokeColor: 0,
                        strokeOpacity: 0,
                        strokeWeight: 0,
                        fillColor: 0,
                        fillOpacity: 0,
                        map: map,
                        center: latlng,
                        radius: 200
                    });
                    var bounds = circle.getBounds();
                    map.fitBounds(circle.getBounds());
                    var destination = new google.maps.Marker({
                        position: latlng, map: map
                    });
                    markers.push(destination);

                } else {
                    alert("位置取得失敗しました、もう一回入力してください")
                }
                //jsonデータを読み込み
                $.ajax({
                    type: "post",
                    url: "/com/ajax/Servlet2",
                    async:false,//ajax完了まで「success」部分実行しない
                    dataType: "json",
                    contentType: 'charset=UTF-8',
                    error: function (jqXHR, textStatus) {
                        alert(textStatus + ":" + jqXHR.status + jqXHR.statusText);
                    },
                    success: function (results) {
                        //マップにマーカーを生成
                        for (var i = 0; i < results.length; i++) {
                            var exit  = new google.maps.Marker({
                                position: {lat: results[i].lat, lng: results[i].lng},
                                map: null,
                                animation: google.maps.Animation.DROP,
                                icon: 'icon/exitTiny.png'
                            });
                            if (results[i].name) {
                                attachMessage(exit, results[i].name)
                            }
                            markers.push(exit);
                            if (bounds.contains(exit.getPosition()) === true) {
                                exit.setMap(map);
                            }
                        }
                    }

                });


                // マーカーをクリックしたときに、吹き出しを出す。
                function attachMessage(marker, msg) {
                    google.maps.event.addListener(marker, 'click', function (event) {
                        new google.maps.InfoWindow({
                            content: msg
                        }).open(marker.getMap(), marker);
                    });
                }
            });
    }
}

// remove,delete,showの実現


function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        map.fitBounds({north: 35.6957527,east: 139.7092613,south: 35.6846075, west: 139.6898095});
    }
}

function　showMarkers(){
    $("#show").attr("class", "btn btn-primary active");
    setMapOnAll(map);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}
function clearMarkers() {
    setMapOnAll(null);
}
