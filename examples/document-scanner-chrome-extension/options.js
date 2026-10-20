function save() {
  const license = document.getElementById("license");
  chrome.storage.sync.set({
    license: license.value
  }, function() {
    // Update status to let user know options were saved.
    alert("saved");
  });
}

function load() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    license: ''
  }, function(items) {
    if (items.license) {
      document.getElementById("license").value = items.license;
    }
  });
}

document.getElementById("save").addEventListener("click", () => {
  save();
});
document.addEventListener('DOMContentLoaded', load);