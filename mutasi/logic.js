var data = {};
let fbsSvc;
let helperTerkunci = null;
let lokasiTerkunci = null;

$(function () {
  fbsSvc = new Fbs(db);

  inisiasiData((hasil) => {
    console.log(hasil);
  });

  function resetForm() {
    $('#hasilCari').html('');
    $('#wadah-cari-id').removeClass('hidden');
    $('#cari-id').val('');

    delete data.dataPick;
    delete data.helperLokasi;

    helperTerkunci = null;
    lokasiTerkunci = null;

    $('#cari-helper')
      .prop('disabled', true)
      .val('')
      .removeClass('bg-gray-100 text-gray-400');

    $('#cari-lokasi')
      .prop('disabled', true)
      .val('')
      .removeClass('bg-gray-100 text-gray-400');

    $('#hasil-final').text('Tentukan Hlp & Loc');
    $('#btn-power').prop('disabled', true);
    $('#reset-button').prop('disabled', true);
    $('#btn-send').prop('disabled', true);
    $('#cari-id').focus();
  }

  function resetFormHlpLoc() {
    $('#cari-id').val('');

    delete data.helperLokasi;
    // delete data.dataPick;

    helperTerkunci = null;
    lokasiTerkunci = null;

    $('#cari-helper')
      .prop('disabled', false)
      .val('')
      .removeClass('bg-gray-100 text-gray-400');

    $('#cari-lokasi')
      .prop('disabled', true)
      .val('')
      .removeClass('bg-gray-100 text-gray-400');

    $('#hasil-final').text('Tentukan Hlp & Loc');
    $('#reset-button').prop('disabled', true);
    $('#btn-send').prop('disabled', true);
    $('#cari-helper').focus();
  }

  $('#btn-power').on('click', function () {
    $('#wadah-part-2').addClass('hidden');
    resetForm();
  });

  $('#btn-send').on('click', function ()  {
    console.log( data.dataPick,data.helperLokasi );
  });

  // resetForm();

  $('#cari-helper').on('input', function () {
    if (helperTerkunci) return;
    const val = $(this).val();
    if (!val) return $('#hasil-final').html(' ');

    const hasil = cariTerdekat(data.helper, val);
    if (hasil) {
      $('#hasil-final').html(`<b>${hasil.v}</b> (Tekan 'ENTER')`);
    } else {
      $('#hasil-final').html("Zonk ...");
    }
  });

  $('#cari-helper').on('keypress', function (e) {
    if (e.key === 'Enter') {
      const val = $(this).val();
      const hasil = cariTerdekat(data.helper, val);
      if (hasil) {
        helperTerkunci = hasil;
        $('#cari-helper')
          .val(helperTerkunci.v)
          .prop('disabled', true)
          .addClass('bg-gray-100 text-gray-400');

        $('#cari-lokasi').prop('disabled', false).focus();
        $('#reset-button').prop('disabled', false);

        $('#hasil-final').html(`Hlp : <b>${hasil.v}</b>. Loc : ?`);
      }
    }
  });

  $('#cari-lokasi').on('input', function () {
    if (lokasiTerkunci) return;
    const val = $(this).val();
    if (!val) return $('#hasil-final').html(`Hlp : <b>${helperTerkunci?.v}</b>. Loc : ?`);

    const hasil = cariLokasi(val, data);
    if (hasil) {
      $('#hasil-final').html(`<b>${hasil.rak.v} ${hasil.kol.v}</b> (Tekan 'ENTER')`);
    } else {
      $('#hasil-final').html("Zonk ...");
    }
  });

  $('#cari-lokasi').on('keypress', function (e) {
    if (e.key === 'Enter') {
      const val = $(this).val();
      const hasil = cariLokasi(val, data);
      if (hasil) {
        lokasiTerkunci = hasil;
        $('#cari-lokasi')
          .val(`${hasil.rak.v} ${hasil.kol.v}`)
          .prop('disabled', true)
          .addClass('bg-gray-100 text-gray-400');

        $('#hasil-final').html(`Hlp : <b>${helperTerkunci?.v}</b> & Loc : <b>${hasil.rak.v} ${hasil.kol.v}</b>`);
        // Tombol reset sudah aktif sejak helper terkunci
        
        $('#btn-send').prop('disabled', false);

        data['helperLokasi'] = {
          helper: {
            i: helperTerkunci.i,
            v: helperTerkunci.v
          },
          lokasi: {
            rak: {
              i: hasil.rak.i,
              v: hasil.rak.v
            },
            kol: {
              i: hasil.kol.i,
              v: hasil.kol.v
            }
          }
        };
      }
    }
  });

  $('#cari-id').on('keypress', function (e) {
    if (e.key === 'Enter') {
      const val = $(this).val();
      // console.log(val);
      const hasilCariId = cariDataKainDariStock(val);
      console.log(hasilCariId);

      const status = (v) => {
        if(v == 'g'){
          return "Grosir";
        }else if (v == 'e'){
          return "Ecer";
        }else if (v == 'h'){
          return "Habis";
        }else {
          return "";
        }

      }

      const nmKn = pecahNamaKain(hasilCariId.k,hasilCariId.j);


      const uiHasil = `<div class="border rounded-xl shadow-md p-4 bg-white space-y-2 text-sm">
        <div class="font-bold text-center text-xl text-gray-800">${nmKn.k_terambil}</div>
        <div class="font-bold text-center text-xl text-gray-800">${nmKn.k_sisa}</div>
        <div class="text-gray-600 text-center text-xl">
            <span class="font-medium"><i class="bi bi-ui-checks"></i> ${hasilCariId.id_stock}</span>
            <span class="font-medium"><i class="bi bi-geo-alt-fill"></i> ${hasilCariId.rkkl}</span>
            <span class="font-medium"><i class="bi bi-inboxes-fill"></i> ${hasilCariId.ltrl}</span>
        </div>
        <div class="text-gray-600 text-center text-xl">
            <span class="font-medium text-blue-600"><i class="bi bi-arrow-down-circle-fill"></i> ${hasilCariId.q} ${hasilCariId.s}</span>
            <span class="font-medium text-red-600"><i class="bi bi-arrow-up-circle-fill"></i> ${hasilCariId.q_o} ${hasilCariId.s}</span>
            <span class="inline-block rounded-full px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700">${status(hasilCariId.stts)}</span>
        </div>
      </div>`;
      // ${hasilCariId.id_kain}
      $('#hasilCari').html(uiHasil);

      $('#btn-power').prop('disabled', false);

      $('#wadah-part-2').removeClass('hidden');

      $('#cari-helper')
        .prop('disabled', false)
        .val('')
        .removeClass('bg-gray-100 text-gray-400');
        
      setTimeout(() => {
        $('#cari-helper').focus();
      }, 200);

      $('#wadah-cari-id').addClass('hidden');

      data['dataPick'] = {hasilCariId,nmKn};
    }
  });

  $('#reset-button').on('click', function () {
    resetFormHlpLoc();
  });

  $('#btn-logout').on('click', function () {
    logout();
  });

  $('#btn-history').on('click', function () {
    history();
  });
});