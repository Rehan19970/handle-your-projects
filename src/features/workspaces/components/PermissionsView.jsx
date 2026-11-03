import { Shield, Check, X } from 'lucide-react';
import { PERMISSION_LABELS, ROLE_PERMISSIONS_MAP } from '../../../constants';

export function PermissionsView() {
  const roles = ['owner', 'admin', 'member', 'guest'];
  const permissions = Object.keys(PERMISSION_LABELS);

  const CheckIcon = () => (
    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
    </div>
  );

  const XIcon = () => (
    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-300 dark:text-slate-600" />
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4 sm:mt-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
          Roles & Permissions
        </h2>
        <p className="text-[11px] sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Default permissions assigned to each role in this workspace.
        </p>
      </div>

      {/* ============= MOBILE: Stacked cards ============= */}
      <ul className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {permissions.map((perm) => (
          <li key={perm} className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5 break-words">
              {PERMISSION_LABELS[perm]}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => {
                const hasAccess = ROLE_PERMISSIONS_MAP[role]?.includes(perm);
                return (
                  <div
                    key={role}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 capitalize truncate">
                      {role}
                    </span>
                    {hasAccess ? <CheckIcon /> : <XIcon />}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {/* ============= DESKTOP: Table ============= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="p-3 lg:p-4 font-medium text-slate-500">Permission</th>
              {roles.map((role) => (
                <th
                  key={role}
                  className="p-3 lg:p-4 font-medium text-slate-500 capitalize text-center w-20 lg:w-24"
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {permissions.map((perm) => (
              <tr
                key={perm}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
              >
                <td className="p-3 lg:p-4 text-slate-700 dark:text-slate-300 font-medium">
                  {PERMISSION_LABELS[perm]}
                </td>
                {roles.map((role) => {
                  const hasAccess = ROLE_PERMISSIONS_MAP[role]?.includes(perm);
                  return (
                    <td key={role} className="p-3 lg:p-4 text-center">
                      <div className="flex justify-center">
                        {hasAccess ? <CheckIcon /> : <XIcon />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}