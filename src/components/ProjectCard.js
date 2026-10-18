import Link from "next/link";
import { Folder, Users, Settings, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function ProjectCard({ project, currentUserId }) {
  const isOwner = project.ownerId === currentUserId;
  const memberCount = project.memberIds?.length || 1;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 line-clamp-1">{project.name}</h3>
              <div className="mt-0.5 flex items-center gap-1.5">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700">
                    <ShieldCheck className="h-3 w-3" /> Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    <UserCheck className="h-3 w-3" /> Member
                  </span>
                )}
                <span className="text-[11px] text-slate-400">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Users className="h-3 w-3" /> {memberCount} {memberCount === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <Link
              href={`/projects/${project.id}/settings`}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Project Settings"
              aria-label={`Settings for ${project.name}`}
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>

        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700 group"
        >
          <span>View Tasks & Board</span>
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
