const memberContainer = document.querySelector("#member-directory");
const directoryStatus = document.querySelector("#directory-status");
const searchInput = document.querySelector("#member-search");
const gridButton = document.querySelector("#grid-view");
const listButton = document.querySelector("#list-view");

let members = [];
let currentView = "grid";
let searchQuery = "";

const membershipNames = {
    1: "Member",
    2: "Silver Member",
    3: "Gold Member"
};

const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

const createDetail = (label, value, href) => {
    const paragraph = createElement("p");
    const strong = createElement("strong", "", `${label}: `);
    paragraph.append(strong);

    if (href) {
        const link = createElement("a", "", value);
        link.href = href;
        
        if (href.startsWith("http")) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }

        paragraph.append(link);
    } else {
        paragraph.append(document.createTextNode(value));
    }

    return paragraph;
};

const createMemberCard = (member) => {
    const card = createElement("article", "member-card");
    const header = createElement("header", "member-card-header");
    const name = createElement("h2", "", member.name);
    const tagline = createElement("p", "member-tagline", member.tagline);
    const levelClass = member.membershipLevel === 3 ? "gold" : member.membershipLevel === 2 ? "silver" : "member";
    const level = createElement("span", `member-level ${levelClass}`, membershipNames[member.membershipLevel] ?? "Member");
    header.append(name, tagline, level);

    const body = createElement("div", "member-card-body");
    const image = createElement("img", "member-image");
    image.alt = `${member.name} logo`;
    image.width = 120;
    image.height = 120;
    image.loading = "lazy";
    image.decoding = "async";
    image.dataset.imageFile = member.image;

    const details = createElement("div", "member-details");
    details.append(
        createDetail("Address", member.address),
        createDetail("Phone", member.phone, `tel:${member.phone.replace(/[^+\d]/g, "")}`),
        createDetail("Website", member.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), member.website)
    );

    const description = createElement("p", "member-description", member.description);
    body.append(image, details, description);
    card.append(header, body);

    return card;
};

const updateViewControls = () => {
    const isGrid = currentView === "grid";
    memberContainer.classList.toggle("is-list", !isGrid);
    gridButton.classList.toggle("is-active", isGrid);
    listButton.classList.toggle("is-active", !isGrid);
    gridButton.setAttribute("aria-pressed", String(isGrid));
    listButton.setAttribute("aria-pressed", String(!isGrid));
};

const renderMembers = () => {
    const filteredMembers = members.filter((member) => {
        const searchableText = `${member.name} ${member.industry} ${member.tagline} ${member.address}`.toLocaleLowerCase("en");
        return searchableText.includes(searchQuery);
    });

    memberContainer.replaceChildren();
    filteredMembers.forEach((member) => memberContainer.append(createMemberCard(member)));

    const resultLabel = filteredMembers.length === 1 ? "business" : "businesses";
    directoryStatus.textContent = `Showing ${filteredMembers.length} of ${members.length} ${resultLabel}.`;

    if (filteredMembers.length === 0) {
        const emptyState = createElement("p", "empty-state", "No businesses match your search. Try another name or industry.");
        emptyState.setAttribute("role", "status");
        memberContainer.append(emptyState);
    }

    updateViewControls();
};

const loadMembers = async () => {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`The directory data could not be loaded (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new TypeError("The directory data must be an array of business records.");
        }

        members = data;
        renderMembers();
    } catch (error) {
        console.error("Directory loading error:", error);
        directoryStatus.textContent = "The business directory is currently unavailable.";
        const errorMessage = createElement("p", "error-state", "Please run this project with a local web server, such as the Live Server extension in VS Code, and try again.");
        memberContainer.replaceChildren(errorMessage);
    }
};

if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        searchQuery = event.currentTarget.value.trim().toLocaleLowerCase("en");
        renderMembers();
    });
}

if (gridButton && listButton) {
    gridButton.addEventListener("click", () => {
        currentView = "grid";
        renderMembers();
    });

    listButton.addEventListener("click", () => {
        currentView = "list";
        renderMembers();
    });
}

loadMembers();