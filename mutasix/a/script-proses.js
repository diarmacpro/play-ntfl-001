  var data = {};
  let fbsSvc;
  let helperTerkunci = null;
  let lokasiTerkunci = null;
  let hasilCariId = null;

  $(function () {
    fbsSvc = new Fbs(db);

    inisiasiData((hasil) => {
      console.log(hasil);
    });

    function status(v) {
      if (v == "g") return "Grosir";
      if (v == "e") return "Ecer";
      if (v == "h") return "Habis";
      return "";
    }

    function resetForm() {
      delete data.helperLokasi;
      helperTerkunci = null;
      lokasiTerkunci = null;
      hasilCariId = null;

      $('#cari-helper')
        .prop('disabled', false)
        .val('')
        .removeClass('bg-gray-100 text-gray-400');

      $('#cari-lokasi')
        .prop('disabled', true)
        .val('')
        .removeClass('bg-gray-100 text-gray-400');

      $('#cari-id')
        .prop('disabled', false)
        .val('')
        .removeClass('bg-gray-100 text-gray-400');

      $('#hasil-final').html('Tentukan Hlp & Loc');
      $('#reset-button').prop('disabled', true);
      $('#hasilCari').html('');
      $('#cari-id').focus();
    }

    $('#reset-button').on('click', resetForm);

    $('#cari-id').on('keypress', function (e) {
      if (e.key === 'Enter') {
        const val = $(this).val().trim();
        if (!val) return;

        hasilCariId = cariDataKainDariStock(val);
        if (!hasilCariId) {
          $('#hasilCari').html('<div class="text-red-600">Data tidak ditemukan.</div>');
          return;
        }

        const uiHasil = `<div class="border rounded-xl shadow-md p-4 bg-white space-y-2 text-sm">
          <div class="font-bold text-lg text-gray-800">${hasilCariId.k || ''}</div>
          <div class="text-gray-600"><span class="font-medium">ID. Barang : ${hasilCariId.id_stock || ''}</span> || ID. Kain : <span class="font-medium">${hasilCariId.id_kain || ''}</span></div>
          <div class="text-gray-600"><i class="bi bi-inboxes-fill"></i> <span class="font-medium">${hasilCariId.rkkl || ''}</span> || <i class="bi bi-inboxes-fill"></i> <span class="font-medium">${hasilCariId.ltrl || ''}</span></div>
          <div class="text-gray-600">
            <span class="font-semibold text-blue-600"><i class="bi bi-arrow-down-circle-fill"></i> ${hasilCariId.q || ''} ${hasilCariId.s || ''}</span> / 
            <span class="font-semibold text-red-600"><i class="bi bi-arrow-up-circle-fill"></i> ${hasilCariId.q_o || ''} ${hasilCariId.s || ''}</span>
          </div>
          <div class="text-gray-600"><span class="inline-block rounded-full px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700">${status(hasilCariId.stts)}</span></div>
        </div>`;

        $('#hasilCari').html(uiHasil);
        $('#cari-id').prop('disabled', true).addClass('bg-gray-100 text-gray-400');
        $('#cari-helper').focus();
      }
    });

    $('#cari-helper').on('input', function () {
      if (helperTerkunci) return;
      const val = $(this).val();
      if (!val) return $('#hasil-final').html('&nbsp;');

      const hasil = cariTerdekat(data.helper, val);
      $('#hasil-final').html(hasil ? `<b>${hasil.v}</b> (Tekan 'ENTER')` : "Zonk ...");
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
      if (!val) {
        $('#hasil-final').html(`Hlp : <b>${helperTerkunci?.v}</b>. Loc : ?`);
        return;
      }

      const hasil = cariLokasi(val, data);
      $('#hasil-final').html(hasil ? `<b>${hasil.rak.v} ${hasil.kol.v}</b> (Tekan 'ENTER')` : "Zonk ...");
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

          data['helperLokasi'] = {
            helper: { i: helperTerkunci.i, v: helperTerkunci.v },
            lokasi: {
              rak: { i: hasil.rak.i, v: hasil.rak.v },
              kol: { i: hasil.kol.i, v: hasil.kol.v }
            }
          };
        }
      }
    });

    // Optional: akses window untuk testing di konsol
    window.proses = function () {
      if (!hasilCariId || !data.helperLokasi) {
        alert("Lengkapi semua data terlebih dahulu.");
        return;
      }
      console.log("Proses dengan data:", {
        kain: hasilCariId,
        helperLokasi: data.helperLokasi
      });
    };

    window.batalProses = function () {
      resetForm();
    };
  });