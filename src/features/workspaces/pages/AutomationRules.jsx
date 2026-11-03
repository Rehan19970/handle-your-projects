import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function AutomationRules({ workspaceId }) {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('task_created');
  const [condField, setCondField] = useState('priority');
  const [condValue, setCondValue] = useState('urgent');
  const [action, setAction] = useState('move_to_column');
  const [actionValue, setActionValue] = useState('in_progress');

  useEffect(() => {
    let isMounted = true;

    const fetchRules = async () => {
      if (!workspaceId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      if (isMounted) setIsLoading(true);
      try {
        const res = await api.get(`/workspaces/${workspaceId}/automations`);
        if (isMounted) setRules(res.data || []);
      } catch (error) {
        if (isMounted) {
          toast.error(
            error?.response?.data?.message || error?.message || 'Failed to load rules'
          );
          setRules([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRules();

    return () => { isMounted = false; };
  }, [workspaceId]);

  const resetForm = () => {
    setName('');
    setTrigger('task_created');
    setCondField('priority');
    setCondValue('urgent');
    setAction('move_to_column');
    setActionValue('in_progress');
  };

  const handleCancel = () => {
    setIsAdding(false);
    resetForm();
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.post(`/workspaces/${workspaceId}/automations`, {
        name,
        trigger,
        condition: { field: condField, operator: 'equals', value: condValue },
        action,
        actionValue,
      });
      setRules([res.data, ...rules]);
      toast.success('Rule created');
      setIsAdding(false);
      resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to create rule'
      );
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (pendingId) return;
    if (!window.confirm('Delete this rule?')) return;

    setPendingId(ruleId);
    const previousRules = rules;
    setRules(rules.filter((r) => r._id !== ruleId));

    try {
      await api.delete(`/workspaces/${workspaceId}/automations/${ruleId}`);
      toast.success('Rule deleted');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to delete rule'
      );
      setRules(previousRules);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4 sm:mt-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
            Automation Rules
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-500 mt-1">
            Set up If/Then logic for your tasks.
          </p>
        </div>
        <Button
          onClick={() => (isAdding ? handleCancel() : setIsAdding(true))}
          size="sm"
          variant={isAdding ? 'outline' : 'primary'}
          className="w-full sm:w-auto shrink-0"
        >
          {isAdding ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> New Rule</>}
        </Button>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
        {/* Add form */}
        {isAdding && (
          <form
            onSubmit={handleAddRule}
            className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 sm:space-y-4 mb-4 sm:mb-6"
          >
            <Input
              placeholder="Rule Name (e.g., Escalate Urgent Tasks)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-11 text-sm"
              required
            />

            {/* IF row */}
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                IF
              </span>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white w-full sm:w-auto"
                >
                  <option value="task_created">Task is Created</option>
                  <option value="task_updated">Task is Updated</option>
                </select>

                <select
                  value={condField}
                  onChange={(e) => setCondField(e.target.value)}
                  className="h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white w-full sm:w-auto"
                >
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>

                <span className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                  equals
                </span>

                <select
                  value={condValue}
                  onChange={(e) => setCondValue(e.target.value)}
                  className="h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white w-full sm:w-auto"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* THEN row */}
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                THEN
              </span>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white w-full sm:w-auto"
                >
                  <option value="move_to_column">Move to Column</option>
                  <option value="set_priority">Set Priority</option>
                </select>

                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white w-full sm:w-auto"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="todo">To Do</option>
                  <option value="done">Done</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            <Button type="submit" size="sm" className="w-full sm:w-auto">
              Save Rule
            </Button>
          </form>
        )}

        {/* Rules list */}
        {isLoading ? (
          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-slate-500">
            Loading rules...
          </div>
        ) : rules.length === 0 && !isAdding ? (
          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-slate-500 px-2">
            No automations yet. Click "New Rule" to create one.
          </div>
        ) : (
          <ul className="space-y-2.5 sm:space-y-3">
            {rules.map((rule) => (
              <li
                key={rule._id}
                className="flex items-start justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                    {rule.name}
                  </p>
                  <div className="text-[10px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-x-1 gap-y-0.5 mt-1 leading-relaxed">
                    <span>IF {rule.condition.field} = {rule.condition.value}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span>
                      THEN {rule.action.replace(/_/g, ' ')}: {rule.actionValue}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule._id)}
                  disabled={pendingId !== null}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md shrink-0 disabled:opacity-40"
                  aria-label="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}