const timestampField = document.querySelector("#timestamp");
const membershipLinks = document.querySelectorAll("[data-dialog-target]");
const membershipDialogs = document.querySelectorAll(".membership-dialog");
const dialogClose = document.querySelectorAll(".dialog-close");

if (timestampField) {
    timestampField.value = new Date().toISOString();
}

membershipLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const dialogId = link.dataset.dialogTarget;
        const dialog = document.getElementById(dialogId);

        if (dialog && typeof dialog.showModal === "function") {
            dialog.showModal();
        }
    });
});

membershipDialogs.forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
});

dialogClose.forEach((button) => {
    button.addEventListener("click", () => {
        button.closest('dialog')?.close();
    });
});