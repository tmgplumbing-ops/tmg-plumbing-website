// Stopgap photos (26 Sep 2026), taken from the old tmgplumbing.ie site.
// Most are TMG's own job photos; the commercial sector shots are stock images
// the old site already used. Swap in new photos here as Tony supplies them:
// drop the file in src/assets/photos/ and change the import below.
import type { ImageMetadata } from 'astro';

import technician from '../assets/photos/technician-plant-room.webp';
import flushMachine from '../assets/photos/power-flushing-machine.webp';
import flushInProgress from '../assets/photos/power-flushing-in-progress.webp';
import pipeBeforeAfter from '../assets/photos/pipe-before-after-cleaning.webp';
import ufhManifold from '../assets/photos/underfloor-manifold.webp';
import ufhPipework from '../assets/photos/underfloor-pipework-install.webp';
import thermalRadiator from '../assets/photos/thermal-camera-radiator.webp';
import thermalLeak from '../assets/photos/thermal-camera-leak.webp';
import deminUnit from '../assets/photos/demineralisation-unit.webp';
import refillStation from '../assets/photos/refill-station.webp';
import limescale from '../assets/photos/limescale-in-pipes.webp';
import oilBoiler from '../assets/photos/oil-boiler-install.webp';
import oilTank from '../assets/photos/bunded-oil-tank.webp';
import plantCylinder from '../assets/photos/plant-room-cylinder.webp';
import plantManifolds from '../assets/photos/plant-room-manifolds.webp';
import scaleTransformer from '../assets/photos/scale-transformer.webp';
import softener from '../assets/photos/water-softener.webp';
import commercialPlant from '../assets/photos/commercial-plant-room.webp';
import hotel from '../assets/photos/hotel-room.webp';
import hospital from '../assets/photos/hospital-ward.webp';
import college from '../assets/photos/college-campus.webp';
import office from '../assets/photos/office-interior.webp';
import industrial from '../assets/photos/industrial-pipework.webp';

export type Photo = { src: ImageMetadata; alt: string; caption?: string; fit?: 'cover' | 'contain' };

export const photos = {
  technician: { src: technician, alt: 'TMG technician beside a demineralising unit and hot water cylinder in a plant room' },
  flushMachine: { src: flushMachine, alt: 'Power flushing machine connected to an underfloor heating manifold' },
  flushInProgress: { src: flushInProgress, alt: 'Power flush in progress on an underfloor heating manifold', caption: 'A power flush under way on an underfloor heating system.' },
  pipeBeforeAfter: { src: pipeBeforeAfter, alt: 'Inside of a heating pipe before and after cleaning', caption: 'Inside a heating pipe, before and after cleaning.' },
  ufhManifold: { src: ufhManifold, alt: 'Underfloor heating manifold with pipework laid across the floor' },
  ufhPipework: { src: ufhPipework, alt: 'Underfloor heating pipework laid out before the screed goes down', caption: 'Underfloor heating pipework laid out, ready for the screed.' },
  thermalRadiator: { src: thermalRadiator, alt: 'Thermal imaging camera showing heat across a radiator' },
  thermalLeak: { src: thermalLeak, alt: 'Thermal imaging camera used to trace hidden pipework', caption: 'Thermal imaging shows where hot pipes run, without lifting floors.' },
  deminUnit: { src: deminUnit, alt: 'Mobile demineralising unit connected to a heating system in a plant room' },
  refillStation: { src: refillStation, alt: 'Refill station with a demineralising cartridge for topping up a heating system', fit: 'contain' },
  limescale: { src: limescale, alt: 'Cut sections of pipe showing different levels of limescale and corrosion', caption: 'Scale and corrosion build up inside pipework when water is left untreated.' },
  oilBoiler: { src: oilBoiler, alt: 'Red oil boiler with low NOx burner installed by TMG' },
  oilTank: { src: oilTank, alt: 'Bunded oil tank installed on a concrete base', caption: 'A bunded oil tank on a solid base.' },
  plantCylinder: { src: plantCylinder, alt: 'Hot water cylinder, buffer tank and pipework in a domestic plant room' },
  plantManifolds: { src: plantManifolds, alt: 'Heat pump cylinder and underfloor heating manifolds installed in a utility room', caption: 'Heat pump cylinder and underfloor manifolds in a utility room.' },
  scaleTransformer: { src: scaleTransformer, alt: 'Magnetic scale transformer fitted to a mains water meter' },
  softener: { src: softener, alt: 'Water softener unit', fit: 'contain', caption: 'A compact water softener.' },
  commercialPlant: { src: commercialPlant, alt: 'Commercial plant room with pumps and insulated pipework' },
  hotel: { src: hotel, alt: 'Hotel bedroom' },
  hospital: { src: hospital, alt: 'Hospital ward' },
  college: { src: college, alt: 'College campus buildings' },
  office: { src: office, alt: 'Open-plan office' },
  industrial: { src: industrial, alt: 'Stainless steel industrial pipework and pumps' },
} satisfies Record<string, Photo>;

// Hero + one in-page photo for each core service (also used by the local SEO
// pages, which point back to these services).
export const servicePhotos: Record<string, { hero: Photo; extra?: Photo }> = {
  'power-flushing': { hero: photos.flushMachine, extra: photos.pipeBeforeAfter },
  'underfloor-heating': { hero: photos.ufhManifold, extra: photos.ufhPipework },
  'leak-detection': { hero: photos.thermalRadiator, extra: photos.thermalLeak },
  demineralisation: { hero: photos.refillStation, extra: photos.limescale },
  'oil-boiler-installs': { hero: photos.oilBoiler, extra: photos.oilTank },
  'plumbing-heating': { hero: photos.plantCylinder, extra: photos.plantManifolds },
  'drinking-water': { hero: photos.scaleTransformer, extra: photos.softener },
};

export const sectorPhotos: Record<string, Photo> = {
  hotels: photos.hotel,
  hospitals: photos.hospital,
  'schools-colleges': photos.college,
  'office-buildings': photos.office,
  industrial: photos.industrial,
  'facility-maintenance': photos.commercialPlant,
};
