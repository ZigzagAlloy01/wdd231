const submissionParameters = new URLSearchParams(window.location.search);
const submissionFields = {
    firstName: document.querySelector("#submitted-first-name"),
    lastName: document.querySelector("#submitted-last-name"),
    email: document.querySelector("#submitted-email"),
    phone: document.querySelector("#submitted-phone"),
    organization: document.querySelector("#submitted-organization"),
    timestamp: document.querySelector("#submitted-timestamp")
};

const requiredSubmissionValues = [
    submissionParameters.get("firstName"),
    submissionParameters.get("lastName"),
    submissionParameters.get("email"),
    submissionParameters.get("phone"),
    submissionParameters.get("organization"),
    submissionParameters.get("timestamp")
];

const hasSubmissionData = requiredSubmissionValues.every((value) => typeof value === "string" && value.trim().length > 0);
const submissionSummary = document.querySelector("#submission-summary");
const submissionMissing = document.querySelector("#submission-missing");

if (hasSubmissionData) {
    submissionFields.firstName.textContent = submissionParameters.get("firstName");
    submissionFields.lastName.textContent = submissionParameters.get("lastName");
    submissionFields.email.textContent = submissionParameters.get("email");
    submissionFields.phone.textContent = submissionParameters.get("phone");
    submissionFields.organization.textContent = submissionParameters.get("organization");

    const submittedDate = new Date(submissionParameters.get("timestamp"));
    submissionFields.timestamp.textContent = Number.isNaN(submittedDate.getTime())
        ? "Date unavailable"
        : new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "America/Ciudad_Juarez"
        }).format(submittedDate);
} else {
    submissionSummary.hidden = true;
    submissionMissing.hidden = false;
}
