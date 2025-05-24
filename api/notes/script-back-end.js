fbsSvc.upd('/app/verif-data-masuk/2025-05-13/-OQHybjXPBUjvid93gYb','',{
    id_hlp:3
},(e,d)=>{
    console.log(d);
})

// update tb so
pR('https://cdn.weva.my.id/apix/updDtSo',{
    "id_stock":10601,
    "tgl_so":"2025-04-18 09:21:41",
    "pic":"2",
    "hlp":"3",
    "ge":"e",
    "kd_rak":21,
    "kd_kol":8,
    "q_so":21.41,
    "q_so_sup":22.41,
    "q_so_nett":23.41
},(d)=>{
    console.log(d);
})

// update tb main
pR('https://cdn.weva.my.id/apix/updDtMain',{
    "id_stock":51497,
    "kd_rak":73,
    "kd_kol":1,
    "q_nett":27.42,
    "id_hlp":8
},(d)=>{
    console.log(d);
})

// cek tb so
pR('https://cdn.weva.my.id/apix/dtSo',{id:51496},(e,d)=>{
    console.log(d.data[0]);
})

// cek tb hst so
pR('https://cdn.weva.my.id/apix/dtSoHst',{id:51497},(e,d)=>{
    console.log(d.data);
})

// insert tb hst so
pR('https://cdn.weva.my.id/apix/iDtSoHst', {
    tgl_hst: '2025-05-23 11:20:07',
    pic_hst: 15,
    id_so: 12345,
    tgl_so: '2025-05-19 09:31:12',
    pic: 1,
    hlp: 2,
    ge: 'g',
    id_stock: 51497,
    kd_rak: 73,
    kd_kol: 1,
    q_so: 100.25
}, (e, d) => {
    console.log(d.data);
});


