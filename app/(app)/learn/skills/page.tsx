"use client";

/**
 * /learn/skills — Class Hall + visual Skill Tree. Choose/advance your class and
 * grow class-specific skills.
 */

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { ClassHall } from "@/components/learn/rpg/ClassHall";
import { SkillTree } from "@/components/learn/rpg/SkillTree";
import { Panel, PanelHeader, ScreenIntro } from "@/components/learn/rpg/primitives";

export default function SkillsPage() {
  return (
    <RpgScreen active="skills">
      {({ ps, selectClass, saving }) => (
        <div className="space-y-4">
          <ScreenIntro
            emoji="🌳"
            title="Your Powers"
            blurb="Pick a hero class that matches what you love, then unlock new learning powers as you level up. You can change your class anytime!"
            accent="#a78bfa"
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
      )}
    </RpgScreen>
  );
}
