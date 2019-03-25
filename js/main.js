$(document).ready(function () {
    // inisiasi API url
    var _url = 'https://my-json-server.typicode.com/talithaizza/belajar-api/mahasiswa';
    // var _url = 'http://localhost/b2/index.php';

    // untuk menampung data semua mahasiswa
    var result = '';

    // untuk menampung gender sbg option di select
    var gender_result = '';
    // untuk menampung gender semua mahasiswa
    var gender = [];


    // $.get(_url,function (data) {
    function renderPage(data) {
        $.each(data, function (key, items) {
            _gend = items.gender;

            result += '<div>' +
                '<h3>' + items.name + '</h3>' +
                '<p>' + _gend + '</p>' +
                '</div>';

            if ($.inArray(_gend, gender) === -1) {
                gender.push(_gend);
                gender_result += "<option value='" + _gend + "'>" + _gend + "</option>";
            }
        });

        $('#mhs-list').html(result);
        $('#mhs-select').html("<option value='semua'>semua</option>" + gender_result);
        // });
    }

    var networkDataReceive = false;
    /*
    * start balapan antara service dengan cache
    * fresh data from online service
    * */
    var networkUpdate = fetch(_url).then(function (response) {
        return response.json();
    }).then(function (data) {
        networkDataReceive = true;
        renderPage(data);
    });

    /* ambilkan data dalam local cache */
    caches.match(_url).then(function (response) {
        if (!response) throw Error("no data on cache")
        return response.json();
    }).then(function (data) {
        if (!networkDataReceive){
            renderPage(data);
            console.log("render from cache");
        }
    }).catch(function () {
        return networkUpdate;
    });

    // filter data

    $("#mhs-select").on('change', function () {
        updateListMahasiswa($(this).val());
    });

    function updateListMahasiswa(opt) {
        var result = '';
        var _url2 = _url;

        // cek opsi yang dipilih
        if (opt !== 'semua'){
            _url2 = _url + '?gender='+opt;
        }

        $.get(_url2,function (data) {
            $.each(data, function (key, items) {
                _gend = items.gender;

                result += '<div>' +
                    '<h3>'+items.name+'</h3>' +
                    '<p>'+_gend+'</p>' +
                    '</div>';
            });

            $('#mhs-list').html(result);
        });
    }
});
//notification

    Notification.requestPermission(function(status){
        console.log('Notif permission status', status);
    });
    function displayNotification(title, msg, url, img ){
        if(Notification.permission === 'granted'){
            navigator.serviceWorker.getRegistration().then(function(reg){
                var options = {
                    body : 'Ini adalah notifikasi',
                    icon : 'images/ugm.png',
                    vibrate : [100,50,100],
                    data : {
                        dateOfArrival : Date.now(),
                        primaryKey : 1
                    },
                    actions : [
                        {
                            action: 'explore', title : 'Kunjungi Situs', 
                            icon : 'images/ceklis.png' 
                        },
                        {
                            action: 'close', title : 'Close Notification', 
                            icon : 'images/cross.png'
                        }
                    ]
                };
                reg.showNotification('Ini Notifikasi', options)
            })
        }
    }
    $("#show-notification").on('click', function(){
        console.log('click button');
        displayNotification("Lorem Ipsum", "Sir Dolor Amet", "http://localhost:8000/");
    })

    function isOnline(){
        var connectionStatus = $('#online-status');
        if (navigator.onLine){
            connectionStatus.html = '<p>anda online</p>';
        }else{
            connectionStatus.html = '<p>anda offline</p>';
        }
    }
window.addEventListener('online', isOnline);
window.addEventListener('offline',isOnline);
isOnline();

if ('serviceWorker' in navigator){
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/serviceworker.js').then(
            function (reg) {
                document.getElementById('load-in-bg').addEventListener('click', ()=>{
                    reg.sync.register('image-fetch').then(()=>{
                        console.log('sync registered');
                    }).catch((err)=>{
                        console.log('unable to fetch image. err: ', err);
                    })
                })
                // registerasi service worker berhasil
                //console.log('SW registration success, scope :',reg.scope);
            }, function (err) {
                // reg failed
                console.log('SW registration faild : ', err);
            }
        );
    })
}


/* 
* Indexed DB
* */

function createDataBase(){
    if(!('indexedDB' in window)){
        console.log('Web Browser tidak mendukung Indexed DB');
        return;
    }
    var request = window.indexedDB.open('latihan-pwa', 1);
    request.onerror = errordbHandle;
    releaseEvents.onupgradeneeded = (e)=>{
        var db = e.target.result;
        db.onerror = errordbHandle;
        var objectStore = db.createObjectStore('mahasiswa',{keyPath : 'nim'});
        console.log('Object store mahasiswa berhasil dibuat');
    }
    request.onsuccess = (e) =>{
        db = e.target.result;
        db.error = errordbHandle;
        console.log('Berhasil melakukan koneksi ke database lokal');
        //lakukan sesuatu...
    }
}

function errordbHandle(e){
    console.log('Error DB : '+e.target.errorCode);
}