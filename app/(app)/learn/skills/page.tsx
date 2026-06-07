"use client";

/**
 * /learn/skills — Class Hall + visual Skill Tree. Choose/advance your class and
 * grow class-specific skills.
 */

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { ClassHall } from "@/components/learn/rpg/ClassHall";
import { SkillTree } from "@/components/learn/rpg/SkillTree";
import { Panel, PanelHeader, ScreenIntro } from "@/components/learn/rpg/primitives";
import { skillsForClass, unlockedSkillCount } from "@/lib/data/rpg-skills";

export default function SkillsPage() {
  return (
    <RpgScreen active="skills">
      {({ ps, selectClass, saving }) => {
        const treeTotal = ps.classId ? skillsForClass(ps.classId).length : 0;
        const treeUnlocked = ps.classId ? unlockedSkillCount(ps.classId, ps.classLevel, ps.unlockedSkillIds) : 0;
        return (
        <div className="space-y-4">
          <ScreenIntro
            emoji="🌳"
            eyebrow="Progression"
            title="Class & Skill Tree"
            blurb="Choose a class that fits your style, then unlock new skills as you level up. Switch class and rebuild your tree whenever you want."
            accent="#a78bfa"
            stats={ps.classId ? [
              { value: `Lv ${ps.classLevel}`, label: ps.cls?.name ?? "Class" },
              { value: `${treeUnlocked}/${treeTotal}`, label: "Skills unlocked" },
              { value: ps.classXp.toLocaleString(), label: "Class XP" },
            ] : undefined}
            progress={ps.classId ? { pct: ps.classLevel_.pct, label: "To next class level" } : undefined}
          />
          <ClassHall ps={ps} onSelectClass={selectClass} saving={saving} />
          <div id="tree">
            {ps.classId ? (
              <SkillTree ps={ps} classId={ps.classId} />
            ) : (
              <Panel accent="#a78bfa">
                <PanelHeader emoji="🌳" title="Skill Tree Hall" subtitle="Choose a class above to reveal your skill tree" accent="#a78bfa" />
                <p className="px-4 pb-4 pt-2 text-sm text-slate-400">
                  Each class has its own tree of learning powers that unlock as your class levels up.
                </p>
              </Panel>
            )}
          </div>
        </div>
        );
      }}
    </RpgScreen>
  );
}
