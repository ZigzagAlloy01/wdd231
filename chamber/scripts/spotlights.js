const spotlightContainer = document.querySelector("#spotlight-container");
const membershipLabels = {
    2: "Silver Member",
    3: "Gold Member"
};

const createSpotlightElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text != undefined) element.textContent = text;
    return element;
};

const shuffleMembers = (members) => {
    const shuffled = [...members];

    for (let index = shuffled.lenght -1; index > 0; index -=1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
};

const createSpotlightDetail = (label, value, href) => {
    const paragraph = createSpotlightElement("p", "spotlight-detail");
    const strong = createSpotlightElement("strong", "", `${label}: `);
    paragraph.append(strong);

    if (href) {
        const link = createSpotlightElement("a", "", value);
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

const createSpotlightCard = (member) => {
    const card = createSpotlightElement("article", "spotlight-card");
    const header = createSpotlightElement("div", "spotlight-card-header");
    const title = createSpotlightElement("h3", "spotlight-company-name", member.name);
    const tagline = createSpotlightElement("p", "spotlight-tagline", member.tagline);
    const levelClass = member.membershipLevel === 3 ? "gold" : "silver";
    const level = createSpotlightElement("span", `spotlight-membership ${levelClass}`, membershipLabels[member.membershipLevel]);
    header.append(title, tagline, level);

    const body = createSpotlightElement("div", "spotlight-card-body");
    const logo = createSpotlightElement("img", "spotlight-logo");
    logo.alt = `${member.name} company logo`;
    logo.width = 112;
    logo.height = 112;
    logo.loading = "lazy";
    logo.decoding = "async";
    logo.src = member.image;

    const details = createSpotlightElement("div", "spotlight-details");
    details.append(
        createSpotlightDetail("Phone", member.phone, `tel:${member.phone.replace(/[^+\d]/g, "")}`),
        createSpotlightDetail("Address", member.address),
        createSpotlightDetail("Website", member.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), member.website)
    );

    body.append(logo, details);
    card.append(header, body);
    return card;
};

const loadSpotlights = async () => {
    try {
        const response = await fetch("https://zigzagalloy01.github.io/wdd231/data/members.json");
        if (!response.ok) {
            throw new Error(`Member data could not be loaded (${response.status}).`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new TypeError("The member data must be an array of business records.");
        }

        const elegibleMembers = members.filter((member) => [2, 3].includes(member.membershipLevel));
        const selectedMembers = shuffleMembers(elegibleMembers).slice(0, 3);

        spotlightContainer.replaceChildren();

        if (selectedMembers.lenght < 2) {
            throw new Error("At least two Silver or Gold member records are required for the spotlights");
        }

        selectedMembers.forEach((member) => spotlightContainer.append(createSpotlightCard(member)));
    } catch (error) {
        console.error("Spotlight loading error: ", error);
        spotlightContainer.replaceChildren(
            createSpotlightElement("p", "spotlight-error", "Business spotlights are unavailable. Please verify the members.json file.")
        );
    }
};

loadSpotlights();