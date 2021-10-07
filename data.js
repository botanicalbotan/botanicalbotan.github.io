
window.moment.locale('id')
const baseData = [
    {tanggal: moment("20210701", "YYYYMMDD"), pasaran:"pon"},
    {tanggal: moment("20210702", "YYYYMMDD"), pasaran:"wage"},
    {tanggal: moment("20210703", "YYYYMMDD"), pasaran:"kliwon"},
    {tanggal: moment("20210704", "YYYYMMDD"), pasaran:"legi"},
    {tanggal: moment("20210705", "YYYYMMDD"), pasaran:"pahing"},
]

$(document).ready(function () {
    for(let i = 0; i<baseData.length; i++){
        $("#test").append('<p>'+baseData[i].tanggal.format("dddd")+' adalah pasaran '+baseData[i].pasaran+'</p>');
    }

    // Ditaro di method biar bisa di cast ulang
    preparingData()

    $('button').click(async function (e) { 
        e.preventDefault();
        const { value: formValues } = await Swal.fire({
            title: 'Pengaturan',
            html:
              `<div class="container">
                    <div class="row">
                        <div class="col">
                            <h4 class="">Nama pasar</h4>
                            <input required class="form-control form-control-lg" type="text" id="inputNamaPasar" placeholder="Nama Pasarmu">
                        </div>
                    </div>
                    
               </div>`+
              `<hr>
               <div class="container">
                    <div class="row mb-3">
                        <div class="col">
                            <h4 class="m-0">Hari pasaran</h4>
                            <small>Kamu bisa pilih lebih dari satu</small>
                        </div>
                    </div>
                    
                    <div class="row pr-5 pl-5  text-left">
                        <div class="col-12 col-sm-6">
                            <input id="cb1" type="checkbox" class="cbPasaran" name="cbPasaran[]" value="pon"/>
                            <label for="cb1">Pon</label>                
                        </div>
                        <div class="col-12 col-sm-6">
                            <input id="cb2" type="checkbox" class="cbPasaran" name="cbPasaran[]" value="wage"/>
                            <label for="cb2">Wage</label>                
                        </div>
                        <div class="col-12 col-sm-6">
                            <input id="cb3" type="checkbox" class="cbPasaran" name="cbPasaran[]" value="kliwon"/>
                            <label for="cb3">Kliwon</label>                
                        </div>
                        <div class="col-12 col-sm-6">
                            <input id="cb4" type="checkbox" class="cbPasaran" name="cbPasaran[]" value="legi"/>
                            <label for="cb4">Legi</label>                
                        </div>
                        <div class="col-12 col-sm-6">
                            <input id="cb5" type="checkbox" class="cbPasaran" name="cbPasaran[]" value="pahing"/>
                            <label for="cb5">Pahing</label>                
                        </div>
                    </div>
                </div>`,
            focusConfirm: false,
            confirmButtonText: 'Simpan',
            willOpen:()=>{
                const checkbox = $('.cbPasaran:checkbox')
                const refreshedPasaran = getMyPasaran()
                refreshedPasaran.forEach(pasar => {
                    for(let i = 0; i<checkbox.length; i++){
                        if(checkbox[i].value === pasar){
                            checkbox[i].checked = true
                        }
                    }
                });

                $('input#inputNamaPasar').val(getPasarName());
            },
            preConfirm: () => {
                let checked = $('.cbPasaran:checkbox:checked')
                let check = []
                for(let i=0; i<checked.length; i++){
                    let find = baseData.find(o => o.pasaran === checked[i].value)
        
                    if(typeof find !== 'undefined'){
                        check.push(checked[i].value)
                    }
                } 

                return [
                    document.getElementById('inputNamaPasar').value
                    ,
                    check
                ]
            }
          })
          
          if (formValues) {
              setPasarName(capsFirstWord(formValues[0]))
              setMyPasaran(formValues[1])
              preparingData()
          }
    });
});
let todaysPasaran = function () {
    const today = moment()
    // console.log(today)
    // console.log(today.format('dddd, DD-MM-YYYY'))
    const diffrerence = today.diff(baseData[0].tanggal, 'days')
    const urutanHari = diffrerence % 5

    return baseData[urutanHari].pasaran
}

let nearestNextPasaran = function () {
    const myPasaran = getMyPasaran()
    let nearest = myPasaran[0]
    let nearestNext = daysToNextPasaran(nearest)

    myPasaran.forEach(element => {
        let elementNext = daysToNextPasaran(element)
        console.log(element + ' dalam: ' + elementNext+' hari, banding sama ' + nearest + ' dalam: ' + nearestNext + ' hari')
        if(elementNext <= nearestNext){
            nearest = element.toLocaleLowerCase()
            nearestNext = elementNext
        }
    });
    return {pasaran: nearest, daysLeft: nearestNext}
}

let preparingData = function () {
    let listPasaran = getMyPasaran()

    $('p#todaysDate').html(moment().format('dddd ['+ capsFirstWord(todaysPasaran()) +'], DD MMMM YYYY'));
    $('p#todaysDate').css('color', 'navajowhite');
    if(listPasaran.includes(todaysPasaran())){
        $("button i.icon-map-marker").removeClass("text-danger").addClass("text-warning");
        
        $('nav.navbar').css('background-color', 'tomato');
        $('#announcement').html('Hari ini pasaran!');
        $('div.jumbotron#firstJumbo').css('background-color', 'tomato');
        $('#additionalAnnouncement').html('Kondisi pasar sedang ramai! Akan lebih banyak orang berdatangan, terutama pedagang dan pembeli dari luar daerah.');
    } else{
        $('nav.navbar').css('background-color', 'mediumseagreen');
        $('#announcement').html('Hari ini tidak pasaran!');
        $('div.jumbotron#firstJumbo').css('background-color', 'mediumseagreen');
        $('#additionalAnnouncement').html('Kondisi pasar cenderung normal, umumnya hanya masyarakat pasar yang berlalu-lalang.');
    }

    let next = nearestNextPasaran()
    $('h3#nextPasaran').html(capsFirstWord(next.pasaran));
    $('h3#nextPasar').html(getPasarName());
    $('h3#nextHari').html(next.daysLeft + ' hari');

    $('button span#btnamapasar').html(getPasarName());
}

/**
 * 
 * @param {string} pasaran fill this only with 'pasaran' day you get from base data Array
 */

let dataPasaranPosition = function (pasaran) {
    return baseData.map(function(e) { return e.pasaran; }).indexOf(pasaran);
}

/**
 * 
 * @param {string} pasaran fill this only with 'pasaran' day you get from base data Array
 */
let daysToNextPasaran = function (pasaran) {
    let urutanHariIni = dataPasaranPosition(todaysPasaran().toLowerCase())
    let urutanTarget = dataPasaranPosition('wage') // default di set ke wage

    let find = baseData.find(o => o.pasaran === pasaran)    
    if(typeof find !== 'undefined'){
        urutanTarget = dataPasaranPosition(pasaran.toLocaleLowerCase())
    }

    if(urutanTarget < urutanHariIni){
        return (baseData.length - 1 - urutanHariIni) + (urutanTarget + 1)
    } else if (urutanTarget === urutanHariIni){
        return 5
    }

    return urutanTarget - urutanHariIni
}

/**
     * 
     * @param {any} dateCheck You can use either moment object or a string based date that supported by moment parsing
     * @returns 
     */

let checkPasaran = function (dateCheck) {
    let tanggal = moment()
    if(typeof dateCheck === 'string'){
        tanggal = moment(dateCheck)
    } else if (dateCheck.isAMomentObject){
        tanggal = dateCheck
    }
    
    console.log(tanggal.format('dddd, DD-MM-YYYY'))
    const diffrerence = tanggal.diff(baseData[0].tanggal, 'days')
    const urutanHari = diffrerence % 5

    return capsFirstWord(baseData[urutanHari].pasaran)
}


/**
 * 
 * @param {String} inputPasaran String that seperated by dollar ($). Example: ***pon$pahing***
 */

let setMyPasaran = function (inputPasaran) {
    let inp = [], pure
    if(Array.isArray(inputPasaran)){
        pure = inputPasaran
    } else{
        pure = inputPasaran.split('$')
    }

    pure.forEach(element => {
        let find = baseData.find(o => o.pasaran === element)
        
        if(typeof find !== 'undefined'){
            inp.push(element)
        }
    });
    localStorage.setItem('savedPasaran', JSON.stringify(inp))
}

let getMyPasaran = function () {
    return (localStorage.getItem('savedPasaran'))? JSON.parse(localStorage.getItem('savedPasaran')) : ['wage', 'legi']
}

/**
 * 
 * @param {String} inputName Nama pasar di lokasimu
 */

let setPasarName = function (inputName) {
    if(inputName){
        localStorage.setItem('pasar', inputName)
    } else{
        localStorage.setItem('pasar', 'Karanggede')
    }
}

let getPasarName = function () {
    return (localStorage.getItem('pasar'))? localStorage.getItem('pasar') : 'Pasar anda'
}

let capsFirstWord = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }