vec3 objectNormal = recalcNormal(displace(position));

#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif