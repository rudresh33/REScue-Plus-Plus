// server/services/resources.js
const csv = require('./csvHandler');
const path = require('path');

async function getResources() {
  return await csv.readResources();
}

async function addResource(payload) {
  const list = await csv.readResources();
  const newID = list.length > 0 ? Math.max(...list.map(r => Number(r.ID))) + 1 : 1;
  const r = {
    ID: String(newID),
    Type: payload.Type || payload.type || '',
    Quantity: Number(payload.Quantity ?? payload.quantity ?? 0),
    Unit: payload.Unit || payload.unit || '',
    Location: payload.Location || payload.location || 'All',
    Priority: payload.Priority || payload.priority || 'Medium'
  };
  list.push(r);
  await csv.writeResources(list);
  return r;
}

async function updateResource(id, payload) {
  const list = await csv.readResources();
  const i = list.findIndex(x => String(x.ID) === String(id));
  if (i === -1) throw new Error('Not found');
  list[i] = {
    ...list[i],
    Type: payload.Type ?? payload.type ?? list[i].Type,
    Quantity: Number(payload.Quantity ?? payload.quantity ?? list[i].Quantity),
    Unit: payload.Unit ?? payload.unit ?? list[i].Unit,
    Location: payload.Location ?? payload.location ?? list[i].Location,
    Priority: payload.Priority ?? payload.priority ?? list[i].Priority
  };
  await csv.writeResources(list);
  return list[i];
}

async function restock(id, delta) {
  const list = await csv.readResources();
  const i = list.findIndex(x => String(x.ID) === String(id));
  if (i === -1) throw new Error('Not found');
  list[i].Quantity = Number(list[i].Quantity || 0) + Number(delta);
  if (list[i].Quantity < 0) list[i].Quantity = 0;
  await csv.writeResources(list);
  return list[i];
}

async function deleteResource(id) {
  try {
    const removed = csv.removeById(path.join(__dirname, '..', 'data', 'resources.csv'), id, 'ID');
    return !!removed;
  } catch (err) {
    // fallback
    const rows = await csv.readResources();
    const filtered = rows.filter(r => String(r.ID) !== String(id));
    if (filtered.length === rows.length) return false;
    await csv.writeResources(filtered);
    return true;
  }
}

/**
 * allocateForCivilian(civilian, requirements)
 * requirements: { "Water Bottle": 2, ... }
 */
async function allocateForCivilian(civilian, requirements = {}) {
  const rows = await csv.readResources();
  const changes = [];
  for (const [type, qty] of Object.entries(requirements)) {
    // prefer same location resources then 'All'
    let idx = rows.findIndex(r => r.Type === type && (r.Location === civilian.Location || r.Location === 'All'));
    if (idx === -1) idx = rows.findIndex(r => r.Type === type);
    if (idx === -1) {
      changes.push({ type, success: false, reason: 'not found' });
      continue;
    }
    const take = Math.max(0, Math.floor(Number(qty)));
    rows[idx].Quantity = Number(rows[idx].Quantity || 0) - take;
    if (rows[idx].Quantity < 0) rows[idx].Quantity = 0;
    changes.push({ type, success: true, remaining: rows[idx].Quantity });
  }
  await csv.writeResources(rows);
  return { success: true, detail: changes };
}

module.exports = {
  getResources,
  addResource,
  updateResource,
  restock,
  deleteResource,
  allocateForCivilian
};
