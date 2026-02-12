'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { BranchingScenarioActivity, ScenarioNode, ScenarioDecisionNode, ScenarioOutcomeNode } from '@/types/activities';

interface Props {
  activity: BranchingScenarioActivity;
  onUpdate: (updates: Partial<BranchingScenarioActivity>) => void;
}

export function BranchingScenarioEditor({ activity, onUpdate }: Props) {
  const updateNode = (nodeId: string, updates: Record<string, unknown>) => {
    const nodes = activity.nodes.map((n) =>
      n.id === nodeId ? { ...n, ...updates } : n
    );
    onUpdate({ nodes });
  };

  const addNode = (type: 'content' | 'decision' | 'outcome') => {
    const id = `node-${Date.now()}`;
    let newNode: any = {
      id,
      type,
      title: '',
      position: { x: 0, y: 0 },
    };

    if (type === 'decision') {
      newNode = {
        ...newNode,
        question: '',
        choices: [
          { id: `ch-${Date.now()}-1`, text: '', targetNodeId: '', feedback: '' },
          { id: `ch-${Date.now()}-2`, text: '', targetNodeId: '', feedback: '' },
        ],
      };
    } else if (type === 'outcome') {
      newNode = {
        ...newNode,
        outcome: { type: 'success', message: '', points: 0 },
      };
    } else {
      newNode.content = '';
    }

    onUpdate({ nodes: [...activity.nodes, newNode] });
  };

  const removeNode = (nodeId: string) => {
    onUpdate({
      nodes: activity.nodes.filter((n) => n.id !== nodeId),
    });
  };

  const updateChoice = (nodeId: string, choiceIndex: number, updates: Record<string, string>) => {
    const node = activity.nodes.find((n) => n.id === nodeId) as ScenarioDecisionNode | undefined;
    if (!node || node.type !== 'decision') return;
    const choices = node.choices.map((c, i) =>
      i === choiceIndex ? { ...c, ...updates } : c
    );
    updateNode(nodeId, { choices });
  };

  const addChoice = (nodeId: string) => {
    const node = activity.nodes.find((n) => n.id === nodeId) as ScenarioDecisionNode | undefined;
    if (!node || node.type !== 'decision') return;
    updateNode(nodeId, {
      choices: [
        ...node.choices,
        { id: `ch-${Date.now()}`, text: '', targetNodeId: '', feedback: '' },
      ],
    });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
        <textarea
          value={activity.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Scenario description..."
          rows={2}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Start Node</label>
        <select
          value={activity.startNodeId}
          onChange={(e) => onUpdate({ startNodeId: e.target.value })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select start node...</option>
          {activity.nodes.map((n) => (
            <option key={n.id} value={n.id}>{n.title || n.id} ({n.type})</option>
          ))}
        </select>
      </div>

      {/* Nodes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Nodes ({activity.nodes.length})
        </label>

        {activity.nodes.map((node) => (
          <div key={node.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary capitalize">{node.type}</span>
              <button
                onClick={() => removeNode(node.id)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={node.title}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
              placeholder="Node title"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />

            {node.type === 'content' && (
              <textarea
                value={(node as ScenarioNode).content || ''}
                onChange={(e) => updateNode(node.id, { content: e.target.value })}
                placeholder="Content..."
                rows={2}
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            )}

            {node.type === 'decision' && (
              <>
                <input
                  type="text"
                  value={(node as ScenarioDecisionNode).question || ''}
                  onChange={(e) => updateNode(node.id, { question: e.target.value })}
                  placeholder="Decision question"
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="space-y-1 pl-2 border-l-2 border-primary/20">
                  {(node as ScenarioDecisionNode).choices?.map((choice, ci) => (
                    <div key={choice.id} className="space-y-1">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(node.id, ci, { text: e.target.value })}
                        placeholder={`Choice ${ci + 1}`}
                        className="w-full text-xs px-2 py-0.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                      <select
                        value={choice.targetNodeId}
                        onChange={(e) => updateChoice(node.id, ci, { targetNodeId: e.target.value })}
                        className="w-full text-[10px] px-2 py-0.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Target node...</option>
                        {activity.nodes.filter((n) => n.id !== node.id).map((n) => (
                          <option key={n.id} value={n.id}>{n.title || n.id}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    onClick={() => addChoice(node.id)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    + Add choice
                  </button>
                </div>
              </>
            )}

            {node.type === 'outcome' && (
              <>
                <select
                  value={(node as ScenarioOutcomeNode).outcome?.type || 'success'}
                  onChange={(e) =>
                    updateNode(node.id, {
                      outcome: { ...(node as ScenarioOutcomeNode).outcome, type: e.target.value },
                    })
                  }
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="success">Success</option>
                  <option value="partial">Partial</option>
                  <option value="failure">Failure</option>
                  <option value="retry">Retry</option>
                </select>
                <input
                  type="text"
                  value={(node as ScenarioOutcomeNode).outcome?.message || ''}
                  onChange={(e) =>
                    updateNode(node.id, {
                      outcome: { ...(node as ScenarioOutcomeNode).outcome, message: e.target.value },
                    })
                  }
                  placeholder="Outcome message"
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => addNode('content')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Content
          </button>
          <button
            onClick={() => addNode('decision')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Decision
          </button>
          <button
            onClick={() => addNode('outcome')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Outcome
          </button>
        </div>
      </div>
    </div>
  );
}
