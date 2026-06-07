const API_URL =
"https://script.google.com/macros/s/AKfycbw5O5MyRFpp8HOPlr4Yw95LjMXB-1PEBPGmYpwjRcKONg69LuOPCI8uY_3V-YQ8-A_-Yg/exec";

document.addEventListener(
"DOMContentLoaded",
function(){

  loadCircles();

  document
  .getElementById("censusPost")
  .addEventListener(
    "change",
    refreshHLBDropdown
  );

  document
  .getElementById("circleNo")
  .addEventListener(
    "change",
    onCircleChange
  );

  document
  .getElementById("hlbNo")
  .addEventListener(
    "change",
    onHLBChange
  );

});

function loadCircles(){

  fetch(
    API_URL +
    "?action=circles"
  )

  .then(r=>r.json())

  .then(function(circles){

    const dropdown =
    document.getElementById(
      "circleNo"
    );

    dropdown.innerHTML =
    '<option value="">Select</option>';

    circles.forEach(circle=>{

      dropdown.innerHTML +=
      `<option value="${circle}">
      ${circle}
      </option>`;

    });

  });

}

function onCircleChange(){

  const circle =
  this.value;

  if(!circle){
    return;
  }

  Promise.all([

    fetch(
      API_URL +
      "?action=supervisor" +
      "&circleNo=" +
      encodeURIComponent(circle)
    ).then(r=>r.json()),

    fetch(
      API_URL +
      "?action=hlbs" +
      "&circleNo=" +
      encodeURIComponent(circle)
    ).then(r=>r.json())

  ])

  .then(([supData, hlbData])=>{

    document.getElementById(
      "supervisorName"
    ).value =
    supData.supervisorName || '';

    document.getElementById(
      "supervisorMobile"
    ).value =
    supData.supervisorMobile || '';

    if(
      document.getElementById(
        "censusPost"
      ).value === "Enumerator"
    ){

      const hlb =
      document.getElementById(
        "hlbNo"
      );

      hlb.innerHTML =
      '<option value="">Select</option>';

      hlbData.forEach(item=>{

        hlb.innerHTML +=
        `<option value="${item}">
        ${item}
        </option>`;

      });

    }

  });

}

function refreshHLBDropdown(){

  const post =
  document.getElementById(
    "censusPost"
  ).value;

  const hlb =
  document.getElementById(
    "hlbNo"
  );

  if(post !== "Enumerator"){

    hlb.disabled = true;

    hlb.innerHTML =
    '<option value="">Not Applicable</option>';

    return;

  }

  hlb.disabled = false;

}

function onHLBChange(){

  const circle =
  document.getElementById(
    "circleNo"
  ).value;

  const hlb =
  document.getElementById(
    "hlbNo"
  ).value;

  if(!circle || !hlb){
    return;
  }

  fetch(

    API_URL +
    "?action=enumerator" +
    "&circleNo=" +
    encodeURIComponent(circle) +
    "&hlbNo=" +
    encodeURIComponent(hlb)

  )

  .then(r=>r.json())

  .then(function(data){

    console.log(
      "Enumerator:",
      data
    );

    document.getElementById(
      "enumeratorName"
    ).value =
    data.enumeratorName || '';

    document.getElementById(
      "mobileNumber"
    ).value =
    data.mobile || '';

  });

}
