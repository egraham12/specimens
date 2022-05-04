// my variables
let width = 570;
let height = 570;
let sunbursts = [];
let r = [1, 1.5, 2, 2.5]; // array of ring levels
let originalText = document.getElementById("changeme").innerHTML;
let offText = "taxonomy of our >2 million specimens";
let innerText = offText;
let hoverHit = false;
let zoom = false;
let z, zoomName, data;

// preload function
function preload() {
  data = loadTable('taxon.csv', 'csv', 'header');
}

// p5.js setup function. Set canvas size and some design choices
function setup() {
  var myCanvas = createCanvas(width, height);
  myCanvas.parent('myCanvas');
  angleMode(DEGREES);
  strokeCap(SQUARE);
  for (i = 0; i < 4; i++) {
    let n = i + 2; // numeric level (aka phylum, class, genus, etc.)
    let s = new Sunburst(r[i], n); // creating new sunburst objects
    sunbursts.push(s); // array of sunburst objects
  }
}

// p5.js draw function
function draw() {
  translate(width / 2, height / 2); // locates 0,0 in center of canvas
  background("white");
  noFill(); // stops the arcs from looking like pie slices
  strokeWeight(30); // affects the size of the arcs
  for (p = 0; p < 4; p++) {
    sunbursts[p].create(zoom)
  }

  strokeWeight(1); // modifies text
  fill("black");
  textSize(14);
  stroke(0);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  text(innerText, -50, -50, 100, 100);
}

// my sunburst constructor function
class Sunburst {
  constructor(ringLvl, numericlevel) {
    this.taxa = data.getArray(); // table as array
    this.ringLvl = ringLvl; // ring level
    this.numericlevel = numericlevel; // taxon level
    this.x = 0; // x-coordinate
    this.y = 0; // y-coordinate
    this.d = 200; // diameter (used for width and height of arc)
    this.b = 0.5; // buffer between arcs
    this.h = []; // array of hues values
    this.hTwo = [];
    this.br = []; // array of brightness values
    this.s = []; // array of saturation values
    this.recordBr = [];
  }
  create(zoom) { // draws my sunbursts
    this.tLevel = [];
    this.totals = [];
    this.phylums = [];
    this.classes = [];
    this.uniqueClasses = [];
    for (i = 0; i < this.taxa.length; i++) {
      let parentCheck = this.taxa[i][2]; // finds the taxa's phylum
      if (zoom == true) { // did the user click on a ring?
        if (parentCheck == zoomName) { // if yes, only show taxa that match that phylum
          this.tLevel.push(this.taxa[i][this.numericlevel]);
          this.totals.push(this.taxa[i][1]);
        } else {} // or else, do nothing
      } else { // if the user did NOT click on the ring, do the following
        this.tLevel.push(this.taxa[i][this.numericlevel]);
        this.totals.push(this.taxa[i][1]);
      }
    }
    this.uniqueNames = this.tLevel.filter(unique); // filter the taxonomic names for unique strings
    this.uniqueTotals = [];
    for (i = 0; i < this.uniqueNames.length; i++) {
      // loop gets the unique names' phylums so the colors match
      for (z = 0; z < this.taxa.length; z++) {
        if (this.uniqueNames[i] == this.taxa[z][this.numericlevel]) {
          this.classes.push(this.taxa[z][3]);
          this.phylums.push(this.taxa[z][2]);
          z = this.taxa.length;
        }
      }
      this.specificName = this.uniqueNames[i];
      this.specificTotal = 0;
      for (z = 0; z < this.taxa.length; z++) {
        if (this.taxa[z][this.numericlevel] === this.specificName) {
          this.specificTotal += int(this.taxa[z][1]);
        }
      }
      if (this.specificTotal > 0) {
        this.uniqueTotals.push(this.specificTotal);
      }
    }
    this.degree = [];
    this.absTotal = 0;
    for (i = 0; i < this.totals.length; i++) {
      this.a = this.totals[i];
      this.absTotal += int(this.a);
    }
    for (i = 0; i < this.uniqueTotals.length; i++) {
      this.quantity = this.uniqueTotals[i];
      this.m = map(this.quantity, 0, this.absTotal, 0, 360);
      this.degree.push(this.m);
    }
    this.uniquePhylums = this.phylums.filter(unique)
    this.uniqueClasses = this.classes.filter(unique)
    
    for (i = 0; i < this.degree.length; i++) { // creating the color array
      this.saturation = 255;
      this.bright = round(abs(map(this.numericlevel, 1, 6, -110, -20)));
      this.s.push(this.saturation);
      this.br.push(this.bright);
      this.recordBr.push(this.bright);
      if (zoom == true){
        this.pos = this.uniqueClasses.indexOf(this.classes[i]);
        this.hueTwo = round(map(this.pos, 0, this.uniqueClasses.length, 10, 390));
        this.hTwo.push(this.hueTwo);
      } else {
        this.pos = this.uniquePhylums.indexOf(this.phylums[i]);
        this.hue = round(map(this.pos, 0, this.uniquePhylums.length, 10, 390));
        this.h.push(this.hue);
        this.hTwo = [];
      }
    }
    for (i = 0; i < this.degree.length; i++) { // assigns the colors
      colorMode(HSB);
      if (zoom == true) {
        stroke(this.hTwo[i], this.s[i], this.br[i]);
      } else {
        stroke(this.h[i], this.s[i], this.br[i]);
      }
      if (i == 0) {
        this.sa = 0;
      } else {
        this.sa += this.degree[i - 1];
      }
      arc(this.x, this.y, this.d * this.ringLvl, this.d * this.ringLvl, this.sa, this.sa + this.degree[i] - this.b);
    }
  }

  // mouseMove constructor function
  mouseMove(px, py) {
    hoverHit = false;
    let k = ["Phylum", "Class", "Order", "Family"];
    let hoverDistance = dist(px, py, width / 2, height / 2);
    this.ringHover = 100;
    for (i = 0; i < 4; i++) {
      let growth = 50 * i;
      let outerRingWidth = 115 + growth;
      let innerRingWidth = 85 + growth;
      if (hoverDistance < outerRingWidth && hoverDistance > innerRingWidth) {
        this.ringHover = i;
      }
    }
    this.sa = 0;
    if (this.ringHover < 100) {
      for (i = 0; i < sunbursts[this.ringHover].degree.length; i++) {
        let hoverDegree = sunbursts[this.ringHover].degree[i];
        if (i == 0) {
          this.sa = 0;
        } else {
          this.sa += sunbursts[this.ringHover].degree[i - 1];
        }
        hoverHit = collidePointArc(px, py, width / 2, height / 2, this.d * sunbursts[this.ringHover].ringLvl, this.sa + (hoverDegree / 2), hoverDegree);
        if (hoverHit == true) { // if the mouse is on an arc, do the following
          innerText = k[this.ringHover] + ": " + sunbursts[this.ringHover].uniqueNames[i] + " Records: " + sunbursts[this.ringHover].uniqueTotals[i]; // change text inside ring
          sunbursts[this.ringHover].br[i] = 255; // changes color if hover over
        } else if (hoverHit == false) {
          this.br[i] = this.recordBr[i];
        }
      }
    } else {
      innerText = offText;
      for (i = 0; i < this.h.length; i++) {
        this.br[i] = this.recordBr[i];
      }
    }
  } // end of mouse move function

  // clicked function
  clicked(px, py) { // my click function
    let hit = false;
    let distance = dist(px, py, width / 2, height / 2);
    let ringClick;
    for (i = 0; i < 4; i++) {
      let growth = 50 * i;
      let outerRingWidth = 115 + growth;
      let innerRingWidth = 85 + growth;
      if (distance < outerRingWidth && distance > innerRingWidth) {
        ringClick = i;
      }
    }
    this.sa = 0;
    if (zoom == true) {
      zoom = false;
      document.getElementById("changeme").innerHTML = originalText;
      select('#infoBox').addClass("d-none");
    } else {
      if (ringClick >= 0 || ringClick <= 3) {
        for (i = 0; i < sunbursts[ringClick].degree.length; i++) {
          let clickDegree = sunbursts[ringClick].degree[i];
          if (i == 0) { // this is the IF statement for all the starting angles
            hit = collidePointArc(px, py, width / 2, height / 2, this.d, clickDegree / 2, clickDegree);
            if (hit == true) {
              select('#changeme').html("You clicked on the ring representing " + sunbursts[ringClick].uniqueNames[i]);
              // only the first ring is clickable
              if (ringClick == 0) {
                zoomName = sunbursts[ringClick].uniqueNames[i];
                zoom = true;
                select('#infoBox').removeClass("d-none");
                select('#card-title').html(sunbursts[ringClick].uniqueNames[i]);
                select('#card-text').html(descriptions.phyla[i].about);
                select('#phy-image').attribute('src', descriptions.phyla[i].url);
              }
            }
          } else {
            this.sa += sunbursts[ringClick].degree[i - 1];
            hit = collidePointArc(px, py, width / 2, height / 2, this.d * sunbursts[ringClick].ringLvl, this.sa + (clickDegree / 2), clickDegree);
            if (hit == true) {
              select('#changeme').html("You clicked on the ring representing " + sunbursts[ringClick].uniqueNames[i]);
              if (ringClick == 0) {
                zoomName = sunbursts[ringClick].uniqueNames[i];
                zoom = true;
                select('#infoBox').removeClass("d-none");
                select('#card-title').html(sunbursts[ringClick].uniqueNames[i]);
                select('#card-text').html(descriptions.phyla[i].about);
                select('#phy-image').attribute('src', descriptions.phyla[i].url);
              }
            }
          }
        }
      } else {
        document.getElementById("changeme").innerHTML = originalText;
        select('#infoBox').addClass("d-none");
      }
    }
  }
}

// the collidePointArc function -- I took this from the p5.js 2Dcollide library. I edited the function because it wasn't performing correctly when the arcs' angles were over 180 degrees. The only thing I edited was the last if/then statement-- it originally also checked if the dot variable was greater than 0. With an angle over 180 degrees, the dot can sometimes be a negative number (depending on mouse position), so I removed that from the if statement.
p5.prototype.collidePointArc = function(px, py, ax, ay, arcRadius, arcHeading, arcAngle, buffer) {
  if (buffer == undefined) {
    buffer = 0;
  }
  var point = this.createVector(px, py); // point
  var arcPos = this.createVector(ax, ay); // arc center point
  var radius = this.createVector(arcRadius, 0).rotate(arcHeading); // arc radius vector
  // pointToArc creates a vector between the mouse and the center of the arc
  var pointToArc = point.copy().sub(arcPos);
  // if the distance between the mouse and 0,0 (arc center) is < or = the circle's radius
  if (point.dist(arcPos) <= (arcRadius + buffer)) {
    // calculates the dot product of the radius and line between the mouse and the center of the circle -- I think this might be the cosine of the angle? I'm unsure
    var dot = radius.dot(pointToArc);
    // finds the angle between the radius and the vector between the mouse and the center of the arc. The maximum this can be is HALF of the angle (since the angle is balanced on either side of the radius). This still produces the correct degrees, even if above 180
    var angle = radius.angleBetween(pointToArc);
    if (angle <= arcAngle / 2 && angle >= -arcAngle / 2) {
      return true;
    }
  }
  return false;
}

// function from StackOverflow that returns unique values from an array
function unique(value, index, self) {
  return self.indexOf(value) === index;
}

// mouse click function
function mousePressed() {
  for (i = 0; i < sunbursts.length; i++) {
    sunbursts[i].clicked(mouseX, mouseY);
  }
}

// mouse move function
function mouseMoved() {
  sunbursts[0].mouseMove(mouseX, mouseY);
  sunbursts[1].mouseMove(mouseX, mouseY);
  sunbursts[2].mouseMove(mouseX, mouseY);
  sunbursts[3].mouseMove(mouseX, mouseY);
}


// I did not write ANY of the text below or take any of the photographs
let descriptions = {
    "phyla": [{
            "name": "Acanthocephala",
            "about": "Acanthocephala is a phylum of parasitic worms known as acanthocephalans, thorny-headed worms, or spiny-headed worms, characterized by the presence of an eversible proboscis, armed with spines, which it uses to pierce and hold the gut wall of its host. Acanthocephalans have complex life cycles, involving at least two hosts, which may include invertebrates, fish, amphibians, birds, and mammals. About 1420 species have been described. (Source: Wikipedia)",
            "url": "https://upload.wikimedia.org/wikipedia/commons/4/42/C_wegeneri.JPG"
        }, {
            "name": "Annelida",
            "about": "The annelids, also known as the ringed worms or segmented worms, are a large phylum, with over 22,000 extant species including ragworms, earthworms, and leeches. The species exist in and have adapted to various ecologies – some in marine environments as distinct as tidal zones and hydrothermal vents, others in fresh water, and yet others in moist terrestrial environments. The basic annelid form consists of multiple segments. Each segment has the same sets of organs and, in most polychates, has a pair of parapodia that many species use for locomotion. Earthworms are oligochaetes that support terrestrial food chains both as prey and in some regions are important in aeration and enriching of soil. The burrowing of marine polychaetes, which may constitute up to a third of all species in near-shore environments, encourages the development of ecosystems by enabling water and oxygen to penetrate the sea floor. In addition to improving soil fertility, annelids serve humans as food and as bait. Scientists observe annelids to monitor the quality of marine and fresh water. Although blood-letting is used less frequently by doctors, some leech species are regarded as endangered species because they have been over-harvested for this purpose in the last few centuries. Ragworms' jaws are now being studied by engineers as they offer an exceptional combination of lightness and strength. Since annelids are soft-bodied, their fossils are rare – mostly jaws and the mineralized tubes that some of the species secreted. (Source: Wikipedia)",
            "url": "http://reproductivelearning.weebly.com/uploads/1/9/3/5/19356875/978910033.jpg"
        },
            {
            "name": "Arthropoda",
            "about": "An arthropod is an invertebrate animal having an exoskeleton (external skeleton), a segmented body, and paired jointed appendages. Arthropods includes insects, arachnids, myriapods, and crustaceans. Arthropods are characterized by their jointed limbs and cuticle made of chitin, often mineralised with calcium carbonate. The arthropod body plan consists of segments, each with a pair of appendages. The rigid cuticle inhibits growth, so arthropods replace it periodically by moulting. Arthopods are bilaterally symmetrical and their body possesses an external skeleton. Some species have wings. Their versatility has enabled them to become the most species-rich members of all ecological guilds in most environments. They have over a million described species, making up more than 80 percent of all described living animal species, some of which, unlike most other animals, are very successful in dry environments. Arthropods range in size from the microscopic crustacean Stygotantulus up to the Japanese spider crab. (Source: Wikipedia)",
            "url": "http://youregettingonmynerves.weebly.com/uploads/5/1/9/8/51982141/130388473.jpg"
        },
            {
            "name": "Brachiopoda",
            "about": "Brachiopod valves are hinged at the rear end, while the front can be opened for feeding or closed for protection. Two major groups are recognized, articulate and inarticulate. The word articulate is used to describe the tooth-and-groove features of the valve-hinge which is present in the articulate group, and absent from the inarticulate group. This is the leading diagnostic feature (fossilizable), by which the two main groups can be readily distinguished. Articulate brachiopods have toothed hinges and simple opening and closing muscles, while inarticulate brachiopods have untoothed hinges and a more complex system of muscles used to keep the two valves aligned. In a typical brachiopod a stalk-like pedicle projects from an opening in one of the valves near the hinges, known as the pedicle valve, keeping the animal anchored to the seabed but clear of silt that would obstruct the opening. At their peak in the Paleozoic era, the brachiopods were among the most abundant filter-feeders and reef-builders, and occupied other ecological niches, including swimming in the jet-propulsion style of scallops. Brachiopod fossils have been useful indicators of climate changes during the Paleozoic. However, after the Permian–Triassic extinction event, brachiopods recovered only a third of their former diversity. A study in 2007 concluded the brachiopods were especially vulnerable to the Permian–Triassic extinction, as they built calcareous hard parts (made of calcium carbonate) and had low metabolic rates and weak respiratory systems. Brachiopods now live mainly in cold water and low light. Fish and crustaceans seem to find brachiopod flesh distasteful and seldom attack them. Among brachiopods, only the lingulids have been fished commercially, on a very small scale. (Source: Wikipedia)",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/LingulaanatinaAA.JPG/1920px-LingulaanatinaAA.JPG"
        },
            {
            "name": "Bryozoa",
            "about": "Bryozoa are a phylum of aquatic invertebrate animals. Typically about 0.5 millimetres (0.020 in) long, they are filter feeders that sieve food particles out of the water using a retractable lophophore, a crown of tentacles lined with cilia. Most marine species live in tropical waters, but a few occur in oceanic trenches, and others are found in polar waters. One class lives only in a variety of freshwater environments, and a few members of a mostly marine class prefer brackish water. Over 4,000 living species are known. One genus is solitary and the rest are colonial. (Source: Wikipedia)",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Haeckel_Bryozoa.jpg/800px-Haeckel_Bryozoa.jpg"
        },
            {
            "name": "Chordata",
            "about": "During some period of their life cycle, chordates possess a notochord, a dorsal nerve cord, pharyngeal slits, an endostyle, and a post-anal tail: these five anatomical features define this phylum. Chordates are divided into three subphyla: Vertebrata (fish, amphibians, reptiles, birds, and mammals); Tunicata (salps and sea squirts); and Cephalochordata (which includes lancelets). Of the more than 65,000 living species of chordates, about half are bony fish that are members of the superclass Osteichthyes. Chordate fossils have been found from as early as the Cambrian explosion, 541 million years ago. (Source: Wikipedia)",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Peregrine_Falcon_12.jpg/1024px-Peregrine_Falcon_12.jpg"
        },
            {
            "name": "Cnidaria",
            "about": "Cnidaria is a phylum containing over 11,000 species of animals found exclusively in aquatic (freshwater and marine) environments: they are predominantly marine. Their distinguishing feature is cnidocytes, specialized cells that they use mainly for capturing prey. Their bodies consist of mesoglea, a non-living jelly-like substance, sandwiched between two layers of epithelium that are mostly one cell thick. They have two basic body forms: swimming medusae and sessile polyps, both of which are radially symmetrical with mouths surrounded by tentacles that bear cnidocytes. Both forms have a single orifice and body cavity that are used for digestion and respiration. Cnidarians' activities are coordinated by a decentralized nerve net and simple receptors. Several free-swimming species of Cubozoa and Scyphozoa possess balance-sensing statocysts, and some have simple eyes. Most cnidarians prey on organisms ranging in size from plankton to animals several times larger than themselves, but many obtain much of their nutrition from dinoflagellates, and a few are parasites. Many are preyed on by other animals including starfish, sea slugs, fish, turtles, and even other cnidarians. (Source: Wikipedia)",
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Cnidaria.png/1280px-Cnidaria.png"
        },
            {
            "name": "Ctenophora",
            "about": "Ctenophores, variously known as comb jellies, sea gooseberries, sea walnuts, or Venus's girdles, are voracious predators. Unlike cnidarians, with which they share several superficial similarities, they lack stinging cells. Instead, in order to capture prey, ctenophores possess sticky cells called colloblasts. (Source: Wikipedia)",
            "url": "https://ucmp.berkeley.edu/cnidaria/images/RedLine1.jpg"
        },
            {
            "name": "Echinodermata",
            "about": "The adults are recognizable by their (usually five-point) radial symmetry, and include such well-known animals as starfish, sea urchins, sand dollars, and sea cucumbers, as well as the sea lilies or stone lilies. Echinoderms are found at every ocean depth, from the intertidal zone to the abyssal zone. Aside from the hard-to-classify Arkarua (a Precambrian animal with echinoderm-like pentamerous radial symmetry), the first definitive members of the phylum appeared near the start of the Cambrian. One group of Cambrian echinoderms, the cinctans (Homalozoa), which are close to the base of the echinoderm origin, have been found to possess external gills used for filter feeding, similar to those possessed by chordates and hemichordates. The echinoderms are important both ecologically and geologically. Ecologically, there are few other groupings so abundant in the biotic desert of the deep sea, as well as shallower oceans. Most echinoderms are able to reproduce asexually and regenerate tissue, organs, and limbs; in some cases, they can undergo complete regeneration from a single limb. (Source: Wikipedia)",
            "url": "https://reproductionsystemproject.weebly.com/uploads/2/6/9/0/26909021/8031607.jpeg?357"
        },
            {
            "name": "Mollusca",
            "about": "Mollusca is one of the most diverse groups of animals on the planet, with at least 50,000 living species (and more likely around 200,000). It includes such familiar organisms as snails, octopuses, squid, clams, scallops, oysters, and chitons. Mollusca also includes some lesser known groups like the monoplacophorans, a group once thought to be extinct for millions of years until one was found in 1952 in the deep ocean off the coast of Costa Rica. Molluscs are a clade of organisms that all have soft bodies which typically have a head and a foot region. Often their bodies are covered by a hard exoskeleton, as in the shells of snails and clams or the plates of chitons. A part of almost every ecosystem in the world, molluscs are extremely important members of many ecological communities. They range in distribution from terrestrial mountain tops to the hot vents and cold seeps of the deep sea, and range in size from 20-meter-long giant squid to microscopic aplacophorans, a millimeter or less in length, that live between sand grains. These creatures have been important to humans throughout history as a source of food, jewelry, tools, and even pets. For example, on the Pacific coast of California, Native Americans consumed large quantities of abalone and especially owl limpets. However, the impact of Native Americans on these molluscan communities pales by comparison to the overharvesting of some molluscan taxa by the United States in the 1960s and 1970s. Species whose members once numbered in the millions, now teeter on the verge of extinction. For example, fewer than 100 white abalone remain after several million individuals were captured and sold as meat in the 1970s. Besides having yummy soft parts, molluscs often have desirable hard parts. The shells of some molluscs are considered quite beautiful and valuable. Molluscs can also be nuisances, such as the common garden snail; and molluscs make up a major component of fouling communities both on docks and on the hulls of ships. (Source: https://ucmp.berkeley.edu/taxa/inverts/mollusca/mollusca.php)",
            "url": "https://ucmp.berkeley.edu/images/taxa/inverts/trivia_squid.jpg"
        },
            {
            "name": "Nermertea",
            "about": "There are about 900 known species in the phylum Nemertini (also spelled Nemertina or Nemertea by different authors). Nemertines are known as ribbon worms because of the great length of many species; the European nemertine Lineus longissimus has been known to reach 30 meters (nearly 100 ft) in length, although most are much shorter. Most nemertines are marine, but there are a few freshwater species, and even a few species that live in moist tropical habitats on land. The most distinctive feature of nemertines is a large proboscis. One group of nemertines is tipped with a piercing barb known as a stylet. In other nemertines, the proboscis is unarmed, but often secretes sticky fluid. To capture prey, the proboscis is rapidly everted (turned inside-out) and shot out of the rhynchocoel. It wraps around the prey, and toxic secretions immobilize the prey; nemertines with stylets use them to stab the prey repeatedly, introducing toxins into the body. Generally, nemertines are carnivorous; most feed on small invertebrates like crustaceans and annelids, but some feed on the eggs of other invertebrates, and a few live inside the mantle cavity of molluscs and feed on microbes filtered out by the host. (Source: https://ucmp.berkeley.edu/nemertini/nemertini.html)",
            "url": "https://ucmp.berkeley.edu/nemertini/baseodiscus.jpg"
        },
            {
            "name": "Platyhelminthes",
            "about": "Flatworm, also called platyhelminth, any of the phylum Platyhelminthes, a group of soft-bodied, usually much flattened invertebrates. A number of flatworm species are free-living, but about 80 percent of all flatworms are parasitic—i.e., living on or in another organism and securing nourishment from it. They are bilaterally symmetrical (i.e., the right and left sides are similar) and lack specialized respiratory, skeletal, and circulatory systems; no body cavity (coelom) is present. The body is not segmented; spongy connective tissue (mesenchyme) constitutes the so-called parenchyma and fills the space between organs. Flatworms are generally hermaphroditic—functional reproductive organs of both sexes occurring in one individual. Like other advanced multicellular animals, they possess three embryonic layers—endoderm, mesoderm, and ectoderm—and have a head region that contains concentrated sense organs and nervous tissue (brain). Most evidence, however, indicates that flatworms are very primitive compared with other invertebrates (such as the arthropods and annelids). Some modern evidence suggests that at least some flatworm species may be secondarily simplified from more complex ancestors. (Source: https://www.britannica.com/animal/flatworm)",
            "url": "https://study.com/cimages/videopreview/videopreview-full/ejcvyyclgh.jpg"
        },
            {
            "name": "Porifera",
            "about": "Poriferans are commonly referred to as sponges. An early branching event in the history of animals separated the sponges from other metazoans. As one would expect based on their phylogenetic position, fossil sponges are among the oldest known animal fossils, dating from the Late Precambrian. Since then, sponges have been conspicuous members of many fossil communities; the number of described fossil genera exceeds 900. The approximately 5,000 living sponge species are classified in the phylum Porifera, which is composed of three distinct groups, the Hexactinellida (glass sponges), the Demospongia, and the Calcarea (calcareous sponges). Sponges are characterized by the possession of a feeding system unique among animals. Poriferans don't have mouths; instead, they have tiny pores in their outer walls through which water is drawn. Cells in the sponge walls filter goodies from the water as the water is pumped through the body and out other larger openings. The flow of water through the sponge is unidirectional, driven by the beating of flagella which line the surface of chambers connected by a series of canals. Sponge cells perform a variety of bodily functions and appear to be more independent of each other than are the cells of other animals. (Source: https://ucmp.berkeley.edu/porifera/porifera.html)",
            "url": "http://www.mesa.edu.au/porifera/gallery/barrel_sponge-Bemep.jpg"
        },
            {
            "name": "Tardigrada",
            "about": "Tardigrades (also known colloquially as water bears or moss piglets) are a phylum of water-dwelling, eight-legged, segmented micro-animals. They were first described by the German zoologist Johann August Ephraim Goeze in 1773. The name Tardigrada (meaning 'slow steppers') was given in 1777 by the Italian biologist Lazzaro Spallanzani. They have been found everywhere: from mountaintops to the deep sea and mud volcanoes;[8] from tropical rain forests to the Antarctic. Tardigrades are among the most resilient known animals, with individual species able to survive extreme conditions that would be rapidly fatal to nearly all other known life forms, such as exposure to extreme temperatures, extreme pressures (both high and low), air deprivation, radiation, dehydration, and starvation. Tardigrades have even survived after exposure to outer space. Usually, tardigrades are about 0.5 mm (0.02 in) long when they are fully grown. They are short and plump, with four pairs of legs, each ending in claws (usually four to eight) or sucking disks. Tardigrades are prevalent in mosses and lichens and feed on plant cells, algae, and small invertebrates. When collected, they may be viewed under a very low-power microscope, making them accessible to students and amateur scientists.",
            "url": "https://upload.wikimedia.org/wikipedia/commons/c/cd/SEM_image_of_Milnesium_tardigradum_in_active_state_-_journal.pone.0045682.g001-2.png"
        }             
             ]};
