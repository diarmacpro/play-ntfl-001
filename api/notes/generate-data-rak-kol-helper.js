callData('https://cdn.weva.my.id/apix/dtHelper',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/helper',v,()=>{})
    })
})

callData('https://cdn.weva.my.id/apix/data/dtRak',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/rak',v,()=>{})
    })
})

callData('https://cdn.weva.my.id/apix/data/dtKol',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/kol',v,()=>{})
    })
})

callData('https://cdn.weva.my.id/apix/data/dtkain',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/kain',v,()=>{})
    })
})


// -- FIX KAIN
callData('https://cdn.weva.my.id/apix/data/dtkain',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/kain',v,()=>{})
    })
})


// ---------------- Ini Fix

fbsSvc.delDt('/app/data/kain',()=>{});

callData('https://cdn.weva.my.id/apix/dtNmKn',{},(e,d)=>{
    _.map(d,(v,k)=>{
        fbsSvc.iDtKy('/app/data/kain',v,()=>{})
    })
})
