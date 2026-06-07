const API_URL =
"https://script.google.com/macros/s/AKfycbw5O5MyRFpp8HOPlr4Yw95LjMXB-1PEBPGmYpwjRcKONg69LuOPCI8uY_3V-YQ8-A_-Yg/exec";

window.onload = function(){

  fetch(
    API_URL +
    "?action=circles"
  )
  .then(response => response.json())
  .then(loadCircles)
  .catch(err=>{

    alert("Error Loading Circles");

    console.error(err);

  });

};

function loadCircles(circles){

  const dropdown =
  document.getElementById(
    "circleNo"
  );

  dropdown.innerHTML =
  '<option value="">Select</option>';

  circles.forEach(circle=>{

    dropdown.innerHTML +=
    `
    <option value="${circle}">
    ${circle}
    </option>
    `;

  });

}

function loadHLBs(hlbs){

  const dropdown =
  document.getElementById(
    "hlbNo"
  );

  dropdown.innerHTML =
  '<option value="">Select</option>';

  hlbs.forEach(hlb=>{

    dropdown.innerHTML +=
    `
    <option value="${hlb}">
    ${hlb}
    </option>
    `;

  });

}

document
.getElementById("censusPost")
.addEventListener(
"change",
function(){

  refreshHLBDropdown();

}
);

document
.getElementById("circleNo")
.addEventListener(
"change",
function(){

  const circle =
  this.value;

  if(!circle){

    document.getElementById(
      "supervisorName"
    ).value = '';

    document.getElementById(
      "supervisorMobile"
    ).value = '';

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

.then(([supervisorData, hlbData])=>{

  document.getElementById(
    "supervisorName"
  ).value =
  supervisorData.supervisorName || '';

  document.getElementById(
    "supervisorMobile"
  ).value =
  supervisorData.supervisorMobile || '';

  if(
    document.getElementById(
      "censusPost"
    ).value === "Enumerator"
  ){

    loadHLBs(hlbData);

  }

})
  .catch(err=>{

    console.error(err);

    alert(
      "Unable to load supervisor details"
    );

  });

}
);

function refreshHLBDropdown(){

  const post =
  document
  .getElementById(
    "censusPost"
  )
  .value;

  const circle =
  document
  .getElementById(
    "circleNo"
  )
  .value;

  const hlb =
  document
  .getElementById(
    "hlbNo"
  );

  if(post !== "Enumerator"){

    hlb.disabled = true;

    hlb.innerHTML =
    '<option value="">Not Applicable</option>';

    document
    .getElementById(
      "enumeratorName"
    )
    .value = '';

    document
    .getElementById(
      "mobileNumber"
    )
    .value = '';

    return;

  }

  hlb.disabled = false;

  if(!circle){

    hlb.innerHTML =
    '<option value="">Select Circle First</option>';

    return;

  }

  fetch(

    API_URL +
    "?action=hlbs" +
    "&circleNo=" +
    encodeURIComponent(circle)

  )

  .then(r=>r.json())

  .then(loadHLBs)

  .catch(err=>{

    console.error(err);

    alert(
      "Unable to load HLB list"
    );

  });

}
document
.getElementById("hlbNo")
.addEventListener(
"change",
function(){

  const circle =
  document
  .getElementById(
    "circleNo"
  )
  .value;

  const hlb =
  this.value;

  if(!circle || !hlb){

    document
    .getElementById(
      "enumeratorName"
    )
    .value = '';

    document
    .getElementById(
      "mobileNumber"
    )
    .value = '';

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
      "ENUMERATOR DATA",
      data
    );

    document
    .getElementById(
      "enumeratorName"
    )
    .value =
    data.enumeratorName || '';

    document
    .getElementById(
      "mobileNumber"
    )
    .value =
    data.mobile || '';

  })

  .catch(err=>{

    console.error(err);

    alert(
      "Unable to load Enumerator Details"
    );

  });

}
);
