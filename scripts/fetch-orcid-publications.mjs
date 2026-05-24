import fs from "fs/promises";

const ORCID_ID = "0000-0002-5198-4519";
const API_URL = `https://pub.orcid.org/v3.0/${ORCID_ID}/works`;

const res = await fetch(API_URL, {
  headers: {
    Accept: "application/json",
  },
});

if (!res.ok) {
  throw new Error(`ORCID request failed: ${res.status}`);
}

const data = await res.json();

const publications = data.group
  .map((group) => {
    const summary = group["work-summary"]?.[0];

    const title = summary?.title?.title?.value ?? "";
    const year = summary?.["publication-date"]?.year?.value ?? "";
    const journal = summary?.["journal-title"]?.value ?? "";
    const type = summary?.type ?? "";

    const doi =
      summary?.["external-ids"]?.["external-id"]?.find(
        (id) => id["external-id-type"] === "doi"
      )?.["external-id-value"] ?? "";

    return {
      year,
      type,
      title,
      journal,
      doi,
    };
  })
  .filter((pub) => pub.title)
  .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

await fs.writeFile(
  "src/data/publications.json",
  JSON.stringify(publications, null, 2)
);

console.log(`Saved ${publications.length} publications.`);