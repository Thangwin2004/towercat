/**
 * Tactical AI Controller for enemy factions
 * Evaluates strategic opportunities: rapid expansion to neutral nodes,
 * opportunist attacks on weak player bases, and defensive reinforcements.
 */

export class TacticalAi {
  constructor(factionId, aggression = 1.0) {
    this.factionId = factionId; // 'enemy_red', 'enemy_gold', 'enemy_purple'
    this.aggression = aggression; // 0.30 (very easy) to 1.65 (nightmare)
    // Relaxed initial grace period for lower aggression so player has time to survey and expand first
    const initialGrace = Math.max(2.5, 3.8 / this.aggression);
    this.timer = initialGrace;
  }

  /**
   * Update AI logic tick
   * @param {number} deltaSeconds
   * @param {Array<Territory>} territories
   * @param {TroopManager} troopManager
   * @param {MapTerrain} mapTerrain
   */
  update(deltaSeconds, territories, troopManager, mapTerrain = null) {
    this.timer -= deltaSeconds;
    if (this.timer > 0) return;

    // Reset decision timer based on aggression tier
    this.timer = 1.4 + (Math.random() * 1.5) / this.aggression;

    // 1. Gather AI's eligible bases (must have enough troops to safely launch)
    const myBases = territories.filter(t => t.owner === this.factionId && t.units >= 8);
    if (myBases.length === 0) return;

    // Pick a base to act
    const sender = myBases[Math.floor(Math.random() * myBases.length)];

    // 2. Scan directly connected candidate target bases (strictly follows road / sea connectivity)
    const candidates = territories.filter(t => {
      if (t.id === sender.id) return false;
      if (mapTerrain) {
        return mapTerrain.areConnected(sender.id, t.id);
      }
      return sender.connections ? sender.connections.has(t.id) : true;
    });

    let bestTarget = null;
    let bestScore = -9999;

    for (const target of candidates) {
      const dx = target.x - sender.x;
      const dy = target.y - sender.y;
      const dist = Math.hypot(dx, dy);

      let score = 0;

      // Base value
      if (target.baseType.type === 'citadel') score += 40;
      else if (target.baseType.type === 'stronghold') score += 20;

      // Target ownership analysis
      if (target.owner === this.factionId) {
        // Friendly reinforcement: only send if target is under attack or low on troops
        if (target.underAttackTimer > 0 && target.units < sender.units * 0.6) {
          score += 60;
        } else {
          score -= 100; // avoid unnecessary cycling
        }
      } else if (target.owner === 'neutral') {
        // Neutral expansion: great target early game
        if (sender.units * 0.5 > target.units) {
          score += 80 - target.units * 1.5;
        } else {
          score += 20;
        }
        // In easy tiers, encourage AI to focus on claiming neutral islands rather than rushing player
        if (this.aggression < 0.6) {
          score += 45;
        }
      } else {
        // Hostile enemy target (Player or rival AI)
        const sendTroops = Math.floor(sender.units * 0.6);
        if (sendTroops > target.units) {
          // Can overpower!
          score += 95 + (target.owner === 'player' ? 25 : 10);
        } else {
          score += 15;
        }
        // In easy tiers, discourage AI from rushing player early
        if (this.aggression < 0.6 && target.owner === 'player') {
          score -= 50;
        }
      }

      // Distance penalty: prefer closer territories
      score -= (dist / 800) * 45;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }

    // 3. Dispatch troops if viable target found
    if (bestTarget && bestScore > 15) {
      const percentage = bestTarget.units > sender.units * 0.45 ? 1.0 : 0.5;
      const count = sender.dispatchTroops(percentage);
      if (count > 0) {
        const route = mapTerrain ? mapTerrain.getRoute(sender.id, bestTarget.id) : null;
        troopManager.spawnWave(sender, bestTarget, count, route);
      }
    }
  }
}
