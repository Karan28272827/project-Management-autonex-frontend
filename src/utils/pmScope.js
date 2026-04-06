export function getPmEmployeeId(user = {}) {
  // Only use employee_id — user.id is a User table PK, not an Employee table PK
  return user.employee_id ?? null;
}

export function getPmProjectIds(parentProjects = [], pmEmployeeId) {
  // No employee_id linked — return all project IDs so the PM sees everything
  if (!pmEmployeeId) return new Set(parentProjects.map((p) => p.id));

  return new Set(
    parentProjects
      .filter((project) => project.program_manager_id === pmEmployeeId)
      .map((project) => project.id)
  );
}

export function getPmProjects(parentProjects = [], pmEmployeeId) {
  const projectIds = getPmProjectIds(parentProjects, pmEmployeeId);
  return parentProjects.filter((project) => projectIds.has(project.id));
}

export function getPmSubProjects(
  subProjects = [],
  parentProjects = [],
  pmEmployeeId,
  allocations = []
) {
  // No employee_id linked — show all sub-projects
  if (!pmEmployeeId) return subProjects;
  const projectIds = getPmProjectIds(parentProjects, pmEmployeeId);
  const allocatedSubProjectIds = new Set(
    allocations
      .filter((allocation) => allocation.employee_id === pmEmployeeId)
      .map((allocation) => allocation.sub_project_id)
  );

  return subProjects.filter((subProject) => {
    const belongsToPmProject =
      subProject.main_project_id && projectIds.has(subProject.main_project_id);
    const directlyAssigned =
      Array.isArray(subProject.assigned_employee_ids) &&
      subProject.assigned_employee_ids.includes(pmEmployeeId);
    const directlyAllocated = allocatedSubProjectIds.has(subProject.id);

    return belongsToPmProject || directlyAssigned || directlyAllocated;
  });
}
